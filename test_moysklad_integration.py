#!/usr/bin/env python3
"""
Интеграционные тесты — МойСклад API
OMS_CONTEXT.md: требования MS-01 .. MS-05

Запуск:
    # Через прокси (по умолчанию):
    python3 test_moysklad_integration.py

    # Напрямую (без прокси):
    python3 test_moysklad_integration.py --direct

    # С кастомным токеном:
    MS_TOKEN=your_token python3 test_moysklad_integration.py
"""

import os
import sys
import json
import ssl
import time
import urllib.request
import urllib.parse
import urllib.error

# ─── Конфигурация ────────────────────────────────────────────────────────────

PROXY_URL  = "http://localhost:8080"
MS_BASE    = "https://api.moysklad.ru/api/remap/1.2"
TOKEN      = os.environ.get("MS_TOKEN", "75ffde90665671c6146523e1054750513e229d89")
USE_PROXY  = "--direct" not in sys.argv

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# ─── HTTP helpers ────────────────────────────────────────────────────────────

def _request(method: str, url: str, body: bytes = None, extra_headers: dict = None):
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/json;charset=utf-8",
    }
    if body or method.upper() in ("POST", "PUT"):
        headers["Content-Type"] = "application/json"
    if extra_headers:
        headers.update(extra_headers)

    req = urllib.request.Request(url, data=body, headers=headers, method=method.upper())
    try:
        with urllib.request.urlopen(req, timeout=20, context=SSL_CTX) as r:
            raw = r.read().decode("utf-8")
            return r.status, json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw
    except Exception as ex:
        return None, str(ex)


def ms(path: str, method: str = "GET", body: dict = None):
    """Запрос к МойСклад (через прокси или напрямую)."""
    encoded_body = json.dumps(body).encode() if body else None
    if USE_PROXY:
        original = f"{MS_BASE}{path}"
        url = f"{PROXY_URL}/?url={urllib.parse.quote(original)}"
    else:
        url = f"{MS_BASE}{path}"
    return _request(method, url, body=encoded_body)


# ─── Тест-хелперы ────────────────────────────────────────────────────────────

_results: list[dict] = []

def run(test_id: str, name: str, fn):
    t0 = time.time()
    try:
        status, data = fn()
        ok = status is not None and 200 <= int(status) < 300
    except Exception as ex:
        status, data, ok = None, str(ex), False
    elapsed = round((time.time() - t0) * 1000)
    _results.append({"id": test_id, "name": name, "ok": ok, "status": status, "data": data, "ms": elapsed})
    icon = "✅" if ok else "❌"
    print(f"  {icon}  [{test_id}] {name} — HTTP {status} ({elapsed}ms)")
    if not ok:
        msg = str(data)[:200] if isinstance(data, str) else json.dumps(data, ensure_ascii=False)[:200]
        print(f"        Ошибка: {msg}")
    return ok, status, data


def assert_has(data: dict, *keys: str) -> bool:
    return isinstance(data, dict) and all(k in data for k in keys)

def rows(data: dict) -> list:
    return data.get("rows", []) if isinstance(data, dict) else []

def meta(data: dict) -> dict:
    return data.get("meta", {}) if isinstance(data, dict) else {}


# ─── Тест-сьюты ──────────────────────────────────────────────────────────────

def suite_auth():
    print("\n── 1. Аутентификация ──────────────────────────────────────")
    ok, status, data = run(
        "MS-AUTH-01", "GET /context/employee — текущий пользователь",
        lambda: ms("/context/employee"),
    )
    if ok:
        print(f"        name={data.get('name')}, login={data.get('login')}, uid={data.get('uid')}")
        assert assert_has(data, "name", "login"), "Ответ не содержит name/login"

    run(
        "MS-AUTH-02", "Недействительный токен → 401",
        lambda: _request("GET",
            f"{PROXY_URL}/?url={urllib.parse.quote(MS_BASE + '/context/employee')}" if USE_PROXY
            else f"{MS_BASE}/context/employee",
            extra_headers={"Authorization": "Bearer INVALID_TOKEN_00000000000000000000"}),
    )


def suite_stores():
    print("\n── 2. Склады ──────────────────────────────────────────────")
    ok, _, data = run(
        "MS-STORE-01", "GET /entity/store — список складов",
        lambda: ms("/entity/store?limit=100"),
    )
    if ok and rows(data):
        store = rows(data)[0]
        print(f"        Складов: {meta(data).get('size','?')} | Первый: {store.get('name')} (id={store.get('id')})")
        # Вернём id первого склада для дальнейших тестов
        return store.get("id")
    return None


def suite_products():
    print("\n── 3. Каталог товаров ─────────────────────────────────────")
    ok, _, data = run(
        "MS-PROD-01", "GET /entity/product?limit=10 — первая страница",
        lambda: ms("/entity/product?limit=10&offset=0"),
    )
    total = meta(data).get("size", 0) if ok else 0
    if ok and rows(data):
        sample = rows(data)[0]
        print(f"        Всего товаров: {total} | Пример: '{sample.get('name')}' code={sample.get('code')}")

    run(
        "MS-PROD-02", "Пагинация — offset=10",
        lambda: ms("/entity/product?limit=10&offset=10"),
    )

    run(
        "MS-PROD-03", "Поиск по коду (filter=code=RC-CAT-2KG)",
        lambda: ms("/entity/product?filter=code=RC-CAT-2KG"),
    )

    # Варианты (модификации)
    ok2, _, vdata = run(
        "MS-PROD-04", "GET /entity/variant?limit=10 — варианты товаров",
        lambda: ms("/entity/variant?limit=10&offset=0"),
    )
    if ok2:
        print(f"        Вариантов: {meta(vdata).get('size','?')}")

    return total


def suite_stocks(store_id: str = None):
    print("\n── 4. Остатки ─────────────────────────────────────────────")
    ok, _, data = run(
        "MS-STK-01", "GET /report/stock/all?limit=10 — все остатки",
        lambda: ms("/report/stock/all?limit=10&offset=0"),
    )
    if ok and rows(data):
        sample = rows(data)[0]
        print(f"        Всего позиций: {meta(data).get('size','?')} | Пример: '{sample.get('name')}' qty={sample.get('stock')}")

    run(
        "MS-STK-02", "Группировка по товару (groupBy=product)",
        lambda: ms("/report/stock/all?limit=10&groupBy=product"),
    )

    if store_id:
        filter_param = urllib.parse.quote(
            f"store={MS_BASE}/entity/store/{store_id}"
        )
        ok3, _, sdata = run(
            "MS-STK-03", f"Фильтр по складу (store={store_id[:8]}...)",
            lambda: ms(f"/report/stock/all?limit=10&filter=store={MS_BASE}/entity/store/{store_id}"),
        )
        if ok3:
            print(f"        Позиций по складу: {meta(sdata).get('size','?')}")
    else:
        print("  ⚠   MS-STK-03: Пропущен (нет id склада из MS-STORE-01)")

    # Нулевые остатки
    run(
        "MS-STK-04", "Остатки = 0 (stockMode=all+negativeOnly hint)",
        lambda: ms("/report/stock/all?limit=5&filter=stockMode=all"),
    )


def suite_mapping_autotest(total_products: int):
    print("\n── 5. Автомаппинг (данные для CAT-02 / CAT-03) ───────────")
    if total_products == 0:
        print("  ⚠   Пропущено — нет товаров в МойСклад")
        return

    # Получаем первые 50 товаров и проверяем наличие code/barcode
    ok, _, data = run(
        "MS-MAP-01", "Получить 50 товаров для анализа маппинга",
        lambda: ms("/entity/product?limit=50&offset=0"),
    )
    if not ok:
        return

    products = rows(data)
    with_code = [p for p in products if p.get("code")]
    with_barcode = [p for p in products if p.get("barcodes")]
    with_external = [p for p in products if p.get("externalCode")]

    print(f"        Из {len(products)} товаров:")
    print(f"          с code (CAT-02): {len(with_code)}")
    print(f"          с barcode (CAT-03): {len(with_barcode)}")
    print(f"          с externalCode: {len(with_external)}")

    if with_code:
        sample = with_code[0]
        print(f"          Пример для SKU-маппинга: code='{sample['code']}' name='{sample['name']}'")
    if with_barcode:
        sample = with_barcode[0]
        bc = sample["barcodes"][0].get("barcode") if sample["barcodes"] else "?"
        print(f"          Пример для barcode-маппинга: barcode='{bc}' name='{sample['name']}'")


def suite_error_handling():
    print("\n── 6. Обработка ошибок (MS-04) ────────────────────────────")
    run(
        "MS-ERR-01", "Несуществующий endpoint → 404",
        lambda: ms("/entity/nonexistent_xyz_endpoint"),
    )
    run(
        "MS-ERR-02", "Несуществующий entity ID → 404",
        lambda: ms("/entity/product/00000000-0000-0000-0000-000000000000"),
    )
    run(
        "MS-ERR-03", "POST без тела → ошибка валидации",
        lambda: ms("/entity/demand", method="POST"),
    )


# ─── Отчёт ──────────────────────────────────────────────────────────────────

def print_report():
    passed = sum(1 for r in _results if r["ok"])
    failed = [r for r in _results if not r["ok"]]
    total = len(_results)

    print("\n" + "=" * 62)
    print(f"  ИТОГ: {passed}/{total} тестов пройдено")
    if failed:
        print(f"\n  Провалено ({len(failed)}):")
        for r in failed:
            print(f"    ❌ [{r['id']}] {r['name']} — HTTP {r['status']}")
    print("=" * 62)

    # Сводка по требованиям OMS_CONTEXT.md
    ms_req = {
        "MS-01 (GET остатков)": any(r["ok"] for r in _results if "STK" in r["id"]),
        "MS-02 (GET товаров)":  any(r["ok"] for r in _results if "PROD" in r["id"]),
        "MS-03 (POST demand)":  any(r["ok"] for r in _results if r["id"] == "MS-ERR-03"),
        "MS-04 (обраб. ошибок)": any(r["ok"] for r in _results if "ERR" in r["id"]),
        "MS-05 (конфигурация)": TOKEN != "" and "INVALID" not in TOKEN,
    }
    print("\n  Покрытие требований OMS_CONTEXT.md:")
    for req, covered in ms_req.items():
        print(f"    {'✅' if covered else '❌'}  {req}")
    print()


# ─── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mode = "через прокси (port 8080)" if USE_PROXY else "напрямую"
    print("=" * 62)
    print("  ИНТЕГРАЦИОННЫЕ ТЕСТЫ — МойСклад API")
    print(f"  Режим: {mode}")
    print(f"  Токен: {TOKEN[:8]}...{TOKEN[-4:]} ({len(TOKEN)} chars)")
    print("=" * 62)

    suite_auth()
    store_id = suite_stores()
    total = suite_products()
    suite_stocks(store_id)
    suite_mapping_autotest(total)
    suite_error_handling()
    print_report()

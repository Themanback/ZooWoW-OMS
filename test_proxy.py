import urllib.request
import urllib.parse
url = "http://localhost:8080/?url=" + urllib.parse.quote("https://api.moysklad.ru/api/remap/1.2/context/employee")
req = urllib.request.Request(url, headers={'Authorization': 'Bearer 75ffde90665671c6146523e1054750513e229d89', 'Accept': 'application/json;charset=utf-8', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e)

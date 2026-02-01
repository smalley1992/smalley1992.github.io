# Tariff Check

Date: 2026-02-01

## Command

```bash
python - <<'PY'
import datetime
import urllib.request
from urllib.error import HTTPError

start=datetime.date(2025,9,1)
end=datetime.date(2026,12,31)
found=[]
current=start
while current<=end:
    for day in (1,2,3,11,15,31):
        try:
            candidate=datetime.date(current.year, current.month, day)
        except ValueError:
            continue
        code=f"SILVER-{str(candidate.year)[2:]}-{candidate.month:02d}-{candidate.day:02d}"
        url=f"https://api.octopus.energy/v1/products/{code}/"
        req=urllib.request.Request(url, method='HEAD')
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status==200:
                    found.append(code)
        except HTTPError as e:
            if e.code!=404:
                print('error', code, e)
        except Exception as e:
            print('error', code, e)
    if current.month==12:
        current=datetime.date(current.year+1,1,1)
    else:
        current=datetime.date(current.year, current.month+1,1)

print('\n'.join(sorted(set(found))) if found else 'none')
PY
```

## Result

```
SILVER-25-09-02
```

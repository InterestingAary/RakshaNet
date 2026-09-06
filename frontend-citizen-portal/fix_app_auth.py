import re

with open('app/authority/page.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'priorityCases={.*?} priorityCases={.*?}', 'priorityCases={priorityCases}', content)
content = re.sub(r'priorityCases={.*?} \n\s*priorityCases={.*?}', 'priorityCases={priorityCases}', content)

with open('app/authority/page.tsx', 'w') as f:
    f.write(content)

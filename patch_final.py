import re
import os

def replace_in_file(filepath, old, new):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# 1. app/authority/page.tsx
replace_in_file('app/authority/page.tsx', 'priorityCases={priorityCases} priorityCases={priorityCases}', 'priorityCases={priorityCases}')

# 2. components/authority/PriorityCaseTable.tsx
with open('components/authority/PriorityCaseTable.tsx', 'r') as f:
    content = f.read()

# Fix priority level comparisons
content = re.sub(r"filterPriority !== 'all' && case\.priorityLevel !== filterPriority", "filterPriority !== 'all' && String(case.priorityLevel) !== filterPriority", content)
content = re.sub(r"filterPriority !== 'all' && String\(case\.priorityLevel\) !== filterPriority", "filterPriority !== 'all' && String(case.priorityLevel) !== filterPriority", content)

content = re.sub(r"filterPriority !== 'all' && case\.priorityLevel !== \(filterPriority as unknown as number\)", "filterPriority !== 'all' && String(case.priorityLevel) !== filterPriority", content)

content = content.replace("case.evacuationStatus === 'safe'", "case.evacuationStatus === 'evacuated'")
content = content.replace("team.evacuationStatus", "team.status")

# Just do a blanket replace for the TS issues in PriorityCaseTable
content = content.replace("case.priorityLevel !== filterPriority", "String(case.priorityLevel) !== filterPriority")
content = content.replace("case.priorityLevel === filterPriority", "String(case.priorityLevel) === filterPriority")

with open('components/authority/PriorityCaseTable.tsx', 'w') as f:
    f.write(content)

# 3. services/authService.ts
replace_in_file('services/authService.ts', 'role: \'admin\'', 'role: \'admin\', token: \'mock-token-123\'')

# 4. services/disasterService.ts
replace_in_file('services/disasterService.ts', 'zone.relatedEntityId', 'zone.id')

print("Patched.")

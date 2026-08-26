import re

with open('components/authority/PriorityCaseTable.tsx', 'r') as f:
    content = f.read()

content = content.replace("c.priorityLevel === filter", "(filter === 'critical' && c.priorityLevel === 1) || (filter === 'high' && c.priorityLevel === 2)")
content = content.replace("priority: string", "priority: number")
content = content.replace("case 'critical':", "case 1:")
content = content.replace("case 'high':", "case 2:")
content = content.replace("case 'medium':", "case 3:")

content = content.replace("case.evacuationStatus === 'safe'", "case.evacuationStatus === 'evacuated'")
content = content.replace("team.evacuationStatus", "team.status")

# Fix for TS2345 in getPriorityColor usage
content = re.sub(r'getPriorityColor\(c\.priorityLevel\)', 'getPriorityColor(c.priorityLevel)', content)

# Check for String comparisons
content = content.replace("String(case.priorityLevel) === filterPriority", "case.priorityLevel === filterPriority")
content = content.replace("String(case.priorityLevel) !== filterPriority", "case.priorityLevel !== filterPriority")
content = content.replace("filterPriority !== 'all'", "filterPriority !== 0")
content = content.replace("filterPriority = 'all'", "filterPriority = 0")

with open('components/authority/PriorityCaseTable.tsx', 'w') as f:
    f.write(content)
print("Done.")

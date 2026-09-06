import re
import os

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

# DashboardMetrics.tsx
path = 'components/authority/DashboardMetrics.tsx'
content = read_file(path)
content = re.sub(r"import type \{ PriorityLevel \} from '@\/types\/priorityLevel';", "", content)
content = re.sub(r"priorityCases: PriorityCase\[\];\s*priorityCases: PriorityCase\[\];", "priorityCases: PriorityCase[];", content)
content = content.replace("shelter.evacuationStatus", "shelter.status")
content = content.replace("shelter.totalCapacity.total", "shelter.totalCapacity")
content = content.replace("shelter.totalCapacity.occupied", "shelter.occupancy")
content = content.replace("team.evacuationStatus", "team.status")
write_file(path, content)

# app/authority/page.tsx
path = 'app/authority/page.tsx'
content = read_file(path)
content = content.replace("priorityCases={priorityCases} priorityCases={priorityCases}", "priorityCases={priorityCases}")
write_file(path, content)

# app/citizen/page.tsx
path = 'app/citizen/page.tsx'
content = read_file(path)
content = content.replace("setLocation(", "setManualLocation(")
content = content.replace("setManualLocation(latlng)", "setManualLocation(latlng as any)")
content = content.replace("setLocation=", "setManualLocation=")
write_file(path, content)

# PriorityCaseTable.tsx
path = 'components/authority/PriorityCaseTable.tsx'
content = read_file(path)
content = content.replace("case.evacuationStatus === 'safe'", "case.evacuationStatus === 'evacuated'")
content = content.replace("team.evacuationStatus", "team.status")
content = content.replace("case.priorityLevel === filterPriority", "String(case.priorityLevel) === String(filterPriority)")
content = content.replace("case.priorityLevel !== filterPriority", "String(case.priorityLevel) !== String(filterPriority)")
write_file(path, content)

# IncidentReportForm.tsx
path = 'components/citizen/IncidentReportForm.tsx'
content = read_file(path)
content = content.replace("await incidentService.submitIncident({", "await incidentService.submitIncident({ severity: 'medium', address: '', imageUrl: null, videoUrl: null, reportedBy: 'citizen', reporterName: null, assignedTeamId: null, affectsRouteId: null,")
write_file(path, content)

# NeedHelpFlow.tsx
path = 'components/citizen/NeedHelpFlow.tsx'
content = read_file(path)
content = content.replace("await incidentService.submitNeedHelp({", "await incidentService.submitNeedHelp({ priority: 'high', imageUrl: null, assignedTeamId: null,")
write_file(path, content)

# services/authService.ts
path = 'services/authService.ts'
content = read_file(path)
content = re.sub(r"\s*updatedAt:\s*.*?,", "", content)
write_file(path, content)

# services/disasterService.ts
path = 'services/disasterService.ts'
content = read_file(path)
content = content.replace("zone.relatedEntityId", "zone.id")
write_file(path, content)

print("Final fixes applied.")

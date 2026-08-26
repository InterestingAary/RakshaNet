import re
import os

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

# 1. DashboardMetrics.tsx
content = read_file('components/authority/DashboardMetrics.tsx')
content = re.sub(r"import type \{ PriorityLevel \} from '@/types/priorityLevel';", "", content)
content = re.sub(r"interface DashboardMetricsProps \{", "interface DashboardMetricsProps {\n  priorityCases: import('@/types').PriorityCase[];", content)
content = content.replace("shelter.evacuationStatus === 'active'", "shelter.status === 'active'")
content = content.replace("shelter.totalCapacity.total", "shelter.totalCapacity")
content = content.replace("shelter.totalCapacity.occupied", "shelter.occupancy")
content = content.replace("team.evacuationStatus", "team.status")
write_file('components/authority/DashboardMetrics.tsx', content)

# 2. app/citizen/page.tsx
content = read_file('app/citizen/page.tsx')
content = content.replace("setLocation(", "setManualLocation(")
content = content.replace("userLocation={location as any}", "userLocation={location as any}") # Try to cast
content = content.replace("userLocation={location}", "userLocation={location as any}") # Try to cast
write_file('app/citizen/page.tsx', content)

# 3. date-fns issues
os.system("npm install date-fns")

# 4. PriorityCaseTable.tsx
content = read_file('components/authority/PriorityCaseTable.tsx')
content = content.replace("case.evacuationStatus === 'safe'", "case.evacuationStatus === 'evacuated'")
content = content.replace("team.evacuationStatus", "team.status")
content = content.replace("filterPriority !== 'all' && case.priorityLevel !== filterPriority", "filterPriority !== 'all' && String(case.priorityLevel) !== String(filterPriority)")
write_file('components/authority/PriorityCaseTable.tsx', content)

# 5. ResponseTeamPanel.tsx
content = read_file('components/authority/ResponseTeamPanel.tsx')
content = content.replace("team.memberCount.length", "team.memberCount")
write_file('components/authority/ResponseTeamPanel.tsx', content)

# 6. ShelterManagement.tsx
content = read_file('components/authority/ShelterManagement.tsx')
content = content.replace("shelter.totalCapacity.total", "shelter.totalCapacity")
content = content.replace("shelter.totalCapacity.occupied", "shelter.occupancy")
write_file('components/authority/ShelterManagement.tsx', content)

# 7. IncidentReportForm.tsx
content = read_file('components/citizen/IncidentReportForm.tsx')
content = re.sub(r"\s*status:\s*['\"].*?['\"],?", "", content)
write_file('components/citizen/IncidentReportForm.tsx', content)

# 8. NeedHelpFlow.tsx
content = read_file('components/citizen/NeedHelpFlow.tsx')
content = re.sub(r"\s*timestamp:\s*.*?,", "", content)
write_file('components/citizen/NeedHelpFlow.tsx', content)

# 9. Map Layers
content = read_file('components/map/BlockedRoadLayer.tsx')
content = content.replace("incident.reportedAt", "incident.reportedAt.toString()")
write_file('components/map/BlockedRoadLayer.tsx', content)

content = read_file('components/map/IncidentLayer.tsx')
content = content.replace("incident.reportedAt", "incident.reportedAt.toString()")
write_file('components/map/IncidentLayer.tsx', content)

# 10. useDisaster.ts / useShelters.ts
content = read_file('hooks/useDisaster.ts')
content = content.replace("status === 'open'", "status === 'active'")
content = content.replace('status === "open"', 'status === "active"')
write_file('hooks/useDisaster.ts', content)

content = read_file('hooks/useShelters.ts')
content = content.replace("status === 'open'", "status === 'active'")
content = content.replace('status === "open"', 'status === "active"')
write_file('hooks/useShelters.ts', content)

# 11. authService.ts
content = read_file('services/authService.ts')
content = re.sub(r"\s*createdAt:\s*.*?,", "", content)
write_file('services/authService.ts', content)

# 12. disasterService.ts
content = read_file('services/disasterService.ts')
content = content.replace("zone.relatedEntityId", "zone.id")
write_file('services/disasterService.ts', content)

print("Fixes applied.")

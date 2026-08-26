import re

with open("context/DisasterContext.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'const disaster = await disasterService.getActiveDisaster();' in line:
        pass # drop it
    elif 'const disasterId = disaster?.id || "evt-001";' in line:
        pass # drop it
    else:
        new_lines.append(line)

# Put it back correctly in the `try {` block
with open("context/DisasterContext.tsx", "w") as f:
    for line in new_lines:
        if 'try {' in line:
            f.write(line)
            f.write('      const disaster = await disasterService.getActiveDisaster();\n')
            f.write('      const disasterId = disaster?.id || "evt-001";\n')
        else:
            f.write(line)

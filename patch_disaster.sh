sed -i '' 's/const \[/const disaster = await disasterService.getActiveDisaster();\n      const disasterId = disaster?.id || "evt-001";\n      const \[/' context/DisasterContext.tsx
sed -i '' '/disasterService.getActiveDisaster(),/d' context/DisasterContext.tsx
sed -i '' 's/disasterService.getHazardZones()/disasterService.getHazardZones(disasterId)/g' context/DisasterContext.tsx
sed -i '' 's/alertService.getAlerts()/alertService.getAlerts(disasterId)/g' context/DisasterContext.tsx
sed -i '' 's/disasterService.getTimeline()/disasterService.getTimeline(disasterId)/g' context/DisasterContext.tsx
sed -i '' '/disaster,/d' context/DisasterContext.tsx

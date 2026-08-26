import re

with open('app/layout.tsx', 'r') as f:
    content = f.read()

# Remove the import
content = re.sub(r'import \{ Geist, Geist_Mono \} from "next\/font\/google";\n', '', content)

# Remove the instantiations
content = re.sub(r'const geistSans = Geist\(\{.*?\}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'const geistMono = Geist_Mono\(\{.*?\}\);\n', '', content, flags=re.DOTALL)

# Replace the className
content = re.sub(r'className=\{`\$\{geistSans\.variable\} \$\{geistMono\.variable\} antialiased`\}', 'className="antialiased"', content)

with open('app/layout.tsx', 'w') as f:
    f.write(content)

print("Removed next/font/google")

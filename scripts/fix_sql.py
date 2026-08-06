import re

with open("scripts/ALL_TABLES_COMBINED.sql", "r") as f:
    content = f.read()

def fix_policy(match):
    full = match.group(0)
    m = re.search(r'CREATE POLICY "([^"]+)"\s+ON\s+(\w+)', full)
    if m:
        name, table = m.group(1), m.group(2)
        return 'DROP POLICY IF EXISTS "' + name + '" ON ' + table + ';\n' + full
    return full

content = re.sub(r'CREATE POLICY "[^"]+"[^;]+;', fix_policy, content)

def fix_trigger(match):
    full = match.group(0)
    m = re.search(r'CREATE TRIGGER (\w+)', full)
    if m:
        name = m.group(1)
        table_match = re.search(r'\bON\s+(\w+)\s', full)
        if table_match:
            return 'DROP TRIGGER IF EXISTS ' + name + ' ON ' + table_match.group(1) + ';\n' + full
    return full

content = re.sub(r'CREATE TRIGGER \w+[^;]+;', fix_trigger, content)
content = content.replace("CREATE VIEW ", "CREATE OR REPLACE VIEW ")

with open("scripts/ALL_TABLES_SAFE.sql", "w") as f:
    f.write(content)

print("Done! Lines:", len(content.splitlines()))

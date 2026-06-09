import re

files = ['E:/Portfolio/Portfolio/orbit.html', 'E:/Portfolio/Portfolio/sentinel.html', 'E:/Portfolio/Portfolio/jsms.html']

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    counter = 1
    def replace_h2(match):
        global counter
        num_str = f"{counter:02d} /"
        counter += 1
        return f'<span class="section-counter">{num_str}</span>\n                    <h2>'

    new_content = re.sub(r'<h2>', replace_h2, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

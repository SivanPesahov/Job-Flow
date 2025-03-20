from docx2python import docx2python
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
with docx2python(sys.argv[1], duplicate_merged_cells=False) as docx_content:
    print(docx_content.text)

from __future__ import annotations

import sys
import json
import copy
import re
from typing import TYPE_CHECKING, Iterator

from lxml import etree

from docx2python.iterators import iter_at_depth
from docx2python.main import docx2python

if TYPE_CHECKING:

    import os

    from lxml.etree import _Element as EtreeElement  # type: ignore


def _copy_new_text(elem: EtreeElement, new_text: str) -> EtreeElement:
    """Copy a text element and replace text.

    :param elem: an etree element with tag w:t
    :param new_text: text to replace elem.text
    :return: a new etree element with tag w:t and text new_text
    """
    new_elem = copy.deepcopy(elem)
    new_elem.text = new_text
    return new_elem


def _new_br_element(elem: EtreeElement) -> EtreeElement:
    """Return a break element with a representative elements namespace.

    :param elem: xml element
    :return: a new br element
    """
    prefix = elem.nsmap["w"]
    return etree.Element(f"{{{prefix}}}br")


class Replacer:
    def __init__(
        self,
        *replacements: tuple[str, str],
    ) -> None:
        """Replace :old: with :new: in all descendants of :root:.

        :param root: an etree element presumably containing descendant text elements
        :param old: text to be replaced
        :param new: replacement text

        Will use softbreaks <br> to preserve line breaks in replacement text.
        """
        self.replacements = replacements
        self.replaceIndex = 0
        self.old, self.new = replacements[self.replaceIndex]
        self.builder = ""
        self.updated_text = []
        self.update = False

    def get_next_replacement(self):
        self.builder = ""
        self.replaceIndex = self.replaceIndex + 1
        self.old, self.new = (
            self.replacements[self.replaceIndex]
            if self.replaceIndex < len(self.replacements)
            else ("", "")
        )
        print()
        print(f"Looking for: {self.old}")

    def recursive_text_replace(self, branch: EtreeElement):
        """Replace any text element contining old with one or more elements.

        :param branch: an etree element
        """
        for elem in tuple(branch):
            if elem.text and elem.text.strip():
                splits = re.split(
                    r"(?<!\b\w\.\w\.)(?<!\b[A-Z][a-z]\.)(?<=[.!?]) +", elem.text
                )
                print(elem.text)
                for split in splits:
                    concat = self.builder.strip() + " " + split
                    concat = re.sub(r"\s+([.,!?;:-])", r"\1", concat)
                    if self.old.startswith(concat.lstrip()):
                        self.update = True
                        self.builder = concat.lstrip()
                        print()
                        print(f"builder: {self.builder}")
                        if split.rstrip(".") == self.old.rstrip("."):
                            self.updated_text.append(self.new)
                            print(f"full match: {split} {self.updated_text}")

                        elif len(splits) > 1:
                            if split == splits[-1]:
                                self.updated_text.append(self.new)
                                print(f"end match: {split} {self.updated_text}")

                            elif split == splits[0]:
                                self.updated_text = [""]
                                print(f"start match: {split} {self.updated_text}")
                        else:
                            self.updated_text = (
                                [self.new]
                                if self.old.startswith(split.lstrip())
                                else [""]
                            )
                            print(f"partial match: {split} {self.updated_text}")

                        if self.builder.rstrip(".") == self.old.rstrip("."):
                            self.get_next_replacement()
                    else:
                        self.updated_text.append(split)

            if not elem.text or self.update == False:
                self.updated_text = []
                self.recursive_text_replace(elem)
                continue

            # create a new text element for each line in replacement text
            # text = elem.text.replace(self.old, self.new)

            new_elems = [
                _copy_new_text(elem, line)
                for line in " ".join(self.updated_text).splitlines()
            ]

            # insert breakpoints where line breaks were
            breaks = [_new_br_element(elem) for _ in new_elems]
            new_elems = [x for pair in zip(new_elems, breaks) for x in pair][:-1]

            # replace the original element with the new elements
            parent = elem.getparent()
            if parent is not None:
                index = parent.index(elem)
                if len(new_elems) > 0:
                    parent[index : index + 1] = new_elems
                else:
                    parent.remove(elem)

            self.update = False
            self.updated_text = []


def replace_docx_text(
    path_in: str | os.PathLike[str],
    path_out: str | os.PathLike[str],
    *replacements: tuple[str, str],
    html: bool = False,
) -> None:
    """Replace text in a docx file.

    :param path_in: path to input docx
    :param path_out: path to output docx with text replaced
    :param replacements: tuples of strings (a, b) replace a with b for each in docx.
    :param html: respect formatting (as far as docx2python can see formatting)
    """
    reader = docx2python(path_in, html=html).docx_reader
    replacer = Replacer(*replacements)
    for file in reader.content_files():
        root = file.root_element
        replacer.recursive_text_replace(root)
    reader.save(path_out)
    reader.close()


# data_list = json.loads(
#     '[{"originalText":"Recent coding bootcamp graduate with a passion for building dynamic, user-friendly web applications.","newText":"Aspiring Backend Developer with a strong foundation in building scalable and high-performance applications."},{"originalText":"Skilled in JavaScript, React and Node.js.","newText":"Proficient in Node.js, Express.js, and SQL, with a focus on backend development."},{"originalText":"Seeking to leverage my technical abilities and strong problem-solving skills in an entry-level full stack developer role.","newText":"Eager to contribute to backend development projects, focusing on digital mortgage and credit risk solutions."},{"originalText":"Acquired practical knowledge of full stack programming including React development, building Node servers using Express APIs and MongoDB databases.","newText":"Acquired practical knowledge of backend programming, including building scalable APIs and working with SQL databases."},{"originalText":"Collaborated with a team of four to create a JavaScript-based web application for ticket reselling, achieving first place in a hackathon.","newText":"Collaborated with cross-functional teams to integrate complex models and solutions into production environments."},{"originalText":"Developed a web-based event manager for the local student organisation using Angular.","newText":"Developed backend services and APIs for various applications, focusing on performance and reliability."},{"originalText":"Co-ordinated operational mission planning and generated concise presentations Introduced an effective management solution for important equipment.","newText":"Led technical discussions and provided mentorship to junior team members in software development practices."},{"originalText":"Operated in the advance team to setup and deploy security measures on a Jewish summer camp.","newText":"Implemented best practices for software development, including code reviews and continuous integration."},{"originalText":"Languages — Javascript | Kotlin | Java | Python","newText":"Languages — JavaScript | Kotlin | Java | Python | C#"},{"originalText":"Back-end — Node.js | Express.js | MongoDB | SQL | GraphQL","newText":"Back-end — Node.js | Express.js | SQL | .NET | C#"}]'
# )
data_list = json.loads(sys.argv[2])
data_tuples = [
    (obj["originalText"], obj["newText"]) for obj in data_list if obj["originalText"]
]

replace_docx_text(
    sys.argv[1], sys.argv[1].replace(".docx", "_new.docx"), *data_tuples, html=True
)

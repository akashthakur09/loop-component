import { SharedString } from "fluid-framework";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import Quill from "quill";

const client = new TinyliciousClient();
const containerSchema = {
  initialObjects: { sharedText: SharedString },
};

const root = document.getElementById("editor");

const createNewEditor = async () => {
  const { container } = await client.createContainer(containerSchema);
  const sharedText = container.initialObjects.sharedText;

  if (sharedText.getLength() === 0) {
    sharedText.insertText(0, "Start typing collaboratively...");
  }

  const id = await container.attach();
  renderQuillEditor(sharedText, root);
  return id;
};

const loadExistingEditor = async (id) => {
  const { container } = await client.getContainer(id, containerSchema);
  const sharedText = container.initialObjects.sharedText;
  renderQuillEditor(sharedText, root);
};

async function start() {
  if (location.hash) {
    await loadExistingEditor(location.hash.substring(1));
  } else {
    const id = await createNewEditor();
    location.hash = id;
  }
}

start().catch((error) => console.error(error));

const renderQuillEditor = (sharedText, elem) => {
  const quill = new Quill(elem, {
    theme: "snow",
    placeholder: "Start typing...",
  });

  let isUpdating = false;

  let initialText = sharedText.getText();
  quill.setText(initialText);

  quill.on("text-change", () => {
    if (isUpdating) return;
    isUpdating = true;
    const newText = quill.getText();
    sharedText.replaceText(0, sharedText.getLength(), newText);
    isUpdating = false;
  });

  sharedText.on("sequenceDelta", () => {
    if (isUpdating) return;
    isUpdating = true;
    const updatedText = sharedText.getText();
    quill.setText(updatedText);
    isUpdating = false;
  });

  window.fluidStarted = true;
};

const copyEditorLink = () => {
  const link = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
  navigator.clipboard.writeText(link).then(() => {
    alert("Editor link copied to clipboard!");
  }).catch((err) => {
    console.error("Failed to copy link: ", err);
  });
};

const copyButton = document.getElementById("copyButton");
copyButton.onclick = copyEditorLink;

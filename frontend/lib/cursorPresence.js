// Monaco owns widget placement, including scrolling, wrapping and font changes.
export function attachCursorPresence({
  editor,
  monaco,
  socket,
  roomId,
  isApplyingRemote,
}) {
  const peers = new Map();
  let timer;
  let disposed = false;
  const remove = ({ id }) => {
    const peer = peers.get(id);
    if (!peer) return;
    editor.removeContentWidget(peer.widget);
    peer.decorations.clear();
    peer.style.remove();
    peers.delete(id);
  };
  const clear = () => {
    clearTimeout(timer);
    timer = undefined;
    [...peers.keys()].forEach((id) => remove({ id }));
  };
  const update = (cursor) => {
    if (disposed || cursor.id === socket.id || cursor.roomId !== roomId) return;
    const model = editor.getModel();
    if (!model) return;
    let peer = peers.get(cursor.id);
    if (!peer) {
      const className = "presence-" + crypto.randomUUID();
      const style = document.createElement("style");
      const color = /^hsl\(\d+, 78%, 72%\)$/.test(cursor.color)
        ? cursor.color
        : "#b5a2ff";
      style.textContent = `.${className} { background: ${color}; opacity: .22; }`;
      document.head.appendChild(style);
      const node = document.createElement("div");
      node.className = "presence-cursor";
      node.style.setProperty("--peer-color", color);
      const label = document.createElement("span");
      label.className = "presence-label";
      label.textContent = cursor.username;
      node.appendChild(label);
      peer = {
        style,
        className,
        position: null,
        decorations: editor.createDecorationsCollection(),
        widget: {
          getId: () => className,
          getDomNode: () => node,
          getPosition: () => ({
            position: peer.position,
            preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
          }),
        },
      };
      peers.set(cursor.id, peer);
      editor.addContentWidget(peer.widget);
    }
    peer.position = model.validatePosition(cursor.position);
    const anchor = model.validatePosition(
      cursor.selection?.anchor || cursor.position,
    );
    const head = model.validatePosition(
      cursor.selection?.head || cursor.position,
    );
    const selection = new monaco.Selection(
      anchor.lineNumber,
      anchor.column,
      head.lineNumber,
      head.column,
    );
    peer.decorations.set(
      selection.isEmpty()
        ? []
        : [
            {
              range: selection,
              options: {
                className: peer.className,
                stickiness:
                  monaco.editor.TrackedRangeStickiness
                    .NeverGrowsWhenTypingAtEdges,
              },
            },
          ],
    );
    editor.layoutContentWidget(peer.widget);
  };
  const send = () => {
    timer = undefined;
    const selection = editor.getSelection();
    if (disposed || !socket.connected || !selection || isApplyingRemote())
      return;
    socket.emit("cursor-move", {
      roomId,
      position: selection.getPosition(),
      selection: {
        anchor: selection.getSelectionStart(),
        head: selection.getPosition(),
      },
    });
  };
  const schedule = () => {
    if (!timer && !isApplyingRemote()) timer = setTimeout(send, 50);
  };
  const sync = () => {
    socket.emit("cursor-sync");
    schedule();
  };
  const snapshot = (cursors) => {
    clear();
    cursors.forEach(update);
    schedule();
  };
  socket.on("cursor-update", update);
  socket.on("cursor-remove", remove);
  socket.on("cursor-snapshot", snapshot);
  socket.on("disconnect", clear);
  socket.on("connect", sync);
  const subscriptions = [
    editor.onDidChangeCursorSelection(schedule),
    editor.onDidChangeModel(() => {
      clear();
      sync();
    }),
    editor.onDidFocusEditorText(schedule),
  ];
  sync();
  return () => {
    disposed = true;
    clear();
    subscriptions.forEach((subscription) => subscription.dispose());
    socket.off("cursor-update", update);
    socket.off("cursor-remove", remove);
    socket.off("cursor-snapshot", snapshot);
    socket.off("disconnect", clear);
    socket.off("connect", sync);
  };
}

const state = {
  bases: [],
};

let ws = adonis.Ws("ws://localhost:3333").connect();
const status = document.querySelector("#ws");

ws.on("open", (socket) => {
  status.innerText = `connected`;
});
ws.on("close", () => {
  status.innerText = "disconnected";
});

const url = "http://localhost:3333/bases";

const basesSelect = document.querySelector("#bases");

fetch(url).then((response) => {
  response.json().then(function (data) {
    data.map((responseBase) => {
      console.log(responseBase);
      const option = document.createElement("option");
      option.value = responseBase.id;
      option.innerText = responseBase.name;
      basesSelect.appendChild(option);
    });
  });
});

const listaBases = document.querySelector("#listaBases");

bases.addEventListener("change", (e) => {
  e.preventDefault();
  if (!state.bases.includes(e.target.value)) {
    state.bases.push(e.target.value);
    renderUl(e.target.value);
    const sarc = ws.subscribe(`sarcs:${e.target.value}`);
    if (sarc) {
      sarc.on("ready", () => {
        sarc.emit("message", e.target.value);
      });

      sarc.on("error", (error) => {
        console.log(error);
      });
      sarc.on("newSarc", (data) => {
        const listaSarcs = document.querySelector("#listaSarcs");
        const li = document.createElement("li");
        li.innerHTML = `<b>motivation:</b> ${data.motivation}
                    <b>type:</b> ${data.type}
                    <b>base:</b> ${data.base}
                  <b>Protocolo:</b> ${data.id}`;
        listaSarcs.appendChild(li);
      });

      sarc.on("close", () => {});
    }
  }
});

function renderUl(base) {
  const listItem = document.createElement("li");
  const excluir = document.createElement("a");
  excluir.setAttribute("href", "#");
  excluir.setAttribute("id", `excluir${base}`);
  excluir.setAttribute("data-value", base);
  excluir.innerText = "X";
  listItem.innerText = base;
  listItem.appendChild(excluir);
  listaBases.appendChild(listItem);

  const linkExcluir = document.querySelector(`#excluir${base}`);
  linkExcluir.addEventListener("click", (event) => {
    event.preventDefault();
    if (state.bases.includes(base)) {
      const index = state.bases.indexOf(base);
      if (index > -1) {
        state.bases.splice(index, 1);
        event.target.parentElement.remove();
        ws.getSubscription(`sarcs:${base}`).close();
      }
    }
  });
}

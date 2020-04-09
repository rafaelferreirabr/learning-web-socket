const state = {
  bases: []
};

let ws = adonis.Ws("ws://localhost:3333").connect();
const status = document.querySelector("#ws");

ws.on("open", socket => {
  status.innerText = `connected`;
});
ws.on("close", () => {
  status.innerText = "disconnected";
});

const url = "http://localhost:3333/bases";

const basesSelect = document.querySelector("#bases");

fetch(url).then(response => {
  response.json().then(function(data) {
    state.baseList = data;
    data.map(responseBase => {
      console.log(responseBase);
      const option = document.createElement("option");
      option.value = responseBase.id;
      option.innerText = responseBase.name;
      basesSelect.appendChild(option);
    });
  });
});

bases.addEventListener("change", e => {
  e.preventDefault();
  const baseId = e.target.value;
  if (!state.bases.includes(baseId)) {
    state.bases.push(baseId);
    renderButtonAssigned(baseId);
    subscribeTopic(baseId);
  }
});

function renderButtonAssigned(baseId) {
  const listaBasesAssinadas = document.querySelector("#listaBasesAssinadas");
  const buttonAssigned = createButtonAssingned(baseId);
  createEventDeleteButton(buttonAssigned);
  listaBasesAssinadas.appendChild(buttonAssigned);
}

function renderSarcs(arraySarcs) {
  arraySarcs.map(sarc => {
    const listaSarcs = document.querySelector("#listaSarcs");
    const linhaSarc = document.createElement("tr");
    linhaSarc.innerHTML = `<th scope="row">${sarc.id}</th>
        <td>${sarc.type}</td>
        <td>${sarc.base}</td>
        <td>${sarc.created_at}</td>`;
    listaSarcs.appendChild(linhaSarc);
  });
}

function createButtonAssingned(baseId) {
  const button = document.createElement("a");
  button.setAttribute("href", "#");
  button.setAttribute("id", `${baseId}`);
  button.setAttribute("class", "btn btn-sm btn-outline-danger");
  button.innerText = state.baseList[baseId - 1].name;
  return button;
}

function createEventDeleteButton(buttonAssigned) {
  const baseId = buttonAssigned.getAttribute("id");
  buttonAssigned.addEventListener("click", event => {
    event.preventDefault();
    if (state.bases.includes(baseId)) {
      const index = state.bases.indexOf(baseId);
      if (index > -1) {
        state.bases.splice(index, 1);
        event.target.remove();
        ws.getSubscription(`sarcs:${baseId}`).close();
      }
    }
  });
}

function subscribeTopic(baseId) {
  const sarc = ws.subscribe(`sarcs:${baseId}`);
  if (sarc) {
    sarc.on("ready", () => {
      sarc.emit("message", baseId);
      sarc.emit("connect", baseId);
      console.log("aberto");
    });

    sarc.on("error", error => {
      console.log(error);
    });
    sarc.on("newSarc", newSarc => {
      renderSarcs([newSarc]);
    });
    sarc.on("openSarcs", sarcs => {
      renderSarcs(sarcs);
    });
    sarc.on("assigned", sarcs => {
      renderSarcs(sarcs);
    });

    sarc.on("close", socket => {
      console.log(`Conexao fechada com o topico ${socket.topic}`);
    });
  }
}

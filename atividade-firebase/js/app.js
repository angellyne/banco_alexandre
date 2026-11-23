// ============================================
// IMPORTS DO FIREBASE
// ============================================
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

// ============================================
// CONSTANTES E ELEMENTOS
// ============================================
const COLECAO = "skatistas";
const skatistasRef = collection(db, COLECAO);

const form   = document.getElementById("formSkater");
const msg    = document.getElementById("mensagem");
const lista  = document.getElementById("lista");
const total  = document.getElementById("total");

// Modal de edição
const modalEditar       = document.getElementById("modalEditar");
const editarForm        = document.getElementById("editarForm");
const fecharModal       = document.getElementById("fecharModal");
const campoNome         = document.getElementById("editarNome");
const campoPais         = document.getElementById("editarPais");
const campoIdade        = document.getElementById("editarIdade");
const campoKickflip     = document.getElementById("editarKickflip");
const campoHeelflip     = document.getElementById("editarHeelflip");
const campoTreflip      = document.getElementById("editarTreflip");
const campoVarial       = document.getElementById("editarVarial");
const campoLaser        = document.getElementById("editarLaser");

let skatistaEditandoId = null; // pega o id do skatista sendo editado

// ============================================
// FEEDBACK VISUAL
// ============================================
function mostrarMensagem(texto, tipo = "sucesso") {
  msg.textContent = texto;
  msg.className = `mensagem ${tipo}`;
  setTimeout(() => { msg.textContent = ""; msg.className = "mensagem"; }, 4000);
}

// ============================================
// CREATE — cadastrar skatista
// ============================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const n = [
    Number(d.kickflip), Number(d.heelflip),
    Number(d.tre_flip), Number(d.varial), Number(d.laser)
  ];

  if (n.some(x => isNaN(x) || x < 0 || x > 10)) {
    return mostrarMensagem("Notas entre 0 e 10.", "erro");
  }

  const media = Number((n.reduce((a, b) => a + b, 0) / n.length).toFixed(1));

  try {
    await addDoc(skatistasRef, {
      nome: d.nome.trim(),
      pais: d.pais.trim(),
      idade: Number(d.idade),
      kickflip: n[0],
      heelflip: n[1],
      tre_flip: n[2],
      varial: n[3],
      laser: n[4],
      media_geral: media,
      criadoEm: serverTimestamp()
    });
    mostrarMensagem("🛹 Salvo no Firebase!", "sucesso");
    form.reset();
    carregar();
  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao salvar (veja F12).", "erro");
  }
});

// ============================================
// READ — carregar ranking
// ============================================
async function carregar() {
  lista.innerHTML = "<p class='vazio'>Carregando...</p>";
  try {
    const snap = await getDocs(query(skatistasRef, orderBy("media_geral", "desc")));
    total.textContent = snap.size;

    if (snap.empty) {
      lista.innerHTML = "<p class='vazio'>Nenhum skatista ainda.</p>";
      return;
    }

    lista.innerHTML = snap.docs.map((docSnap, i) => {
      const s = docSnap.data();
      const m = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
      return `<div class="skatista">
        <div class="posicao">${m}</div>
        <div class="dados">
          <div class="nome">${s.nome}</div>
          <div class="info">${s.pais} • ${s.idade} anos</div>
          <div class="notas">K:${s.kickflip} H:${s.heelflip} T:${s.tre_flip} V:${s.varial} L:${s.laser}</div>
        </div>
        <div class="media">
          <div class="valor">${Number(s.media_geral).toFixed(1)}</div>
          <div class="label">MÉDIA</div>
        </div>
        <div class="acoes">
          <button class="btn-editar" data-id="${docSnap.id}">✏️</button>
          <button class="btn-remover" data-id="${docSnap.id}">🗑️</button>
        </div>
      </div>`;
    }).join("");

    // Eventos dos botões
    lista.querySelectorAll(".btn-remover").forEach(b =>
      b.addEventListener("click", () => remover(b.dataset.id))
    );
    lista.querySelectorAll(".btn-editar").forEach(b =>
      b.addEventListener("click", () => abrirEdicao(b.dataset.id))
    );

  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p class='vazio'>Erro ao carregar.</p>";
  }
}

// ============================================
// UPDATE — abrir modal com dados do skatista
// ============================================
async function abrirEdicao(id) {
  skatistaEditandoId = id;
  try {
    const referencia = doc(db, COLECAO, id);
    const documento  = await getDoc(referencia); // getDoc()
    const s = documento.data();

    campoNome.value     = s.nome;
    campoPais.value     = s.pais;
    campoIdade.value    = s.idade;
    campoKickflip.value = s.kickflip;
    campoHeelflip.value = s.heelflip;
    campoTreflip.value  = s.tre_flip;
    campoVarial.value   = s.varial;
    campoLaser.value    = s.laser;

    modalEditar.classList.add("ativo");
  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao abrir edição.", "erro");
  }
}

// ============================================
// UPDATE — salvar alterações
// ============================================
editarForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const notas = [
    Number(campoKickflip.value),
    Number(campoHeelflip.value),
    Number(campoTreflip.value),
    Number(campoVarial.value),
    Number(campoLaser.value)
  ];

  if (notas.some(n => isNaN(n) || n < 0 || n > 10)) {
    return mostrarMensagem("Notas entre 0 e 10.", "erro");
  }

  const media = Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1));

  const referencia = doc(db, COLECAO, skatistaEditandoId);

  try {
    await updateDoc(referencia, { // updateDoc()
      nome: campoNome.value.trim(),
      pais: campoPais.value.trim(),
      idade: Number(campoIdade.value),
      kickflip: notas[0],
      heelflip: notas[1],
      tre_flip: notas[2],
      varial: notas[3],
      laser: notas[4],
      media_geral: media
    });

    modalEditar.classList.remove("ativo");
    mostrarMensagem("✏️ Alterações salvas!", "sucesso");
    carregar();
  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao salvar alterações.", "erro");
  }
});

// ============================================
// FECHAR MODAL
// ============================================
fecharModal.addEventListener("click", () => {
  modalEditar.classList.remove("ativo");
});

modalEditar.addEventListener("click", (e) => {
  if (e.target === modalEditar) {
    modalEditar.classList.remove("ativo");
  }
});

// Fecha com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modalEditar.classList.remove("ativo");
});

// ============================================
// DELETE — remover skatista
// ============================================
async function remover(id) {
  if (!confirm("Remover este skatista?")) return;
  try {
    await deleteDoc(doc(db, COLECAO, id));
    mostrarMensagem("🗑️ Removido!", "sucesso");
    carregar();
  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao remover.", "erro");
  }
}

// ============================================
// INIT
// ============================================
carregar();

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// CONFIGURAÇÃO INICIAL

const area = document.getElementById("cenario3d");
const descricao = document.getElementById("descricao");
const carregamento = document.getElementById("carregamento");

const cena = new THREE.Scene();
cena.background = new THREE.Color(0x11151d);
cena.fog = new THREE.Fog(0x11151d, 20, 45);

const camera = new THREE.PerspectiveCamera(
    50,
    area.clientWidth / area.clientHeight,
    0.1,
    100
);

camera.position.set(11, 9, 13);

const renderizador = new THREE.WebGLRenderer({
    antialias: true
});

renderizador.setSize(area.clientWidth, area.clientHeight);
renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
renderizador.outputColorSpace = THREE.SRGBColorSpace;

area.appendChild(renderizador.domElement);

const controles = new OrbitControls(
    camera,
    renderizador.domElement
);

controles.target.set(0, 1.3, 0);
controles.enableDamping = true;
controles.dampingFactor = 0.05;
controles.minDistance = 6;
controles.maxDistance = 25;
controles.maxPolarAngle = Math.PI / 2.05;

// ILUMINAÇÃO

cena.add(
    new THREE.HemisphereLight(
        0xffffff,
        0x37313a,
        2
    )
);

const luzPrincipal = new THREE.DirectionalLight(
    0xffe0b0,
    3
);

luzPrincipal.position.set(-5, 12, 8);
luzPrincipal.castShadow = true;
luzPrincipal.shadow.mapSize.set(2048, 2048);

cena.add(luzPrincipal);

const luzAzul = new THREE.PointLight(
    0x367cff,
    35,
    20
);

luzAzul.position.set(7, 5, -5);
cena.add(luzAzul);

// MATERIAIS

const material = (cor, metal = 0) =>
    new THREE.MeshStandardMaterial({
        color: cor,
        roughness: 0.65,
        metalness: metal
    });

const preto = material(0x20252c);
const escuro = material(0x141820);
const vermelho = material(0xb92532);
const azul = material(0x2369b5);
const dourado = material(0xd5a64f, 0.4);
const branco = material(0xe8e8e8);
const pele = material(0xb87955);
const vermelhoLuva = material(0xe22e3a);
const azulLuva = material(0x287bd1);

// FUNÇÕES DE CONSTRUÇÃO

function caixa(l, a, p, mat, x, y, z) {

    const objeto = new THREE.Mesh(
        new THREE.BoxGeometry(l, a, p),
        mat
    );

    objeto.position.set(x, y, z);
    objeto.castShadow = true;
    objeto.receiveShadow = true;

    cena.add(objeto);

    return objeto;
}

function cilindro(raio, altura, mat, x, y, z) {

    const objeto = new THREE.Mesh(
        new THREE.CylinderGeometry(
            raio,
            raio,
            altura,
            24
        ),
        mat
    );

    objeto.position.set(x, y, z);
    objeto.castShadow = true;

    cena.add(objeto);

    return objeto;
}

function esfera(raio, mat, x, y, z) {

    const objeto = new THREE.Mesh(
        new THREE.SphereGeometry(raio, 24, 24),
        mat
    );

    objeto.position.set(x, y, z);
    objeto.castShadow = true;

    cena.add(objeto);

    return objeto;
}

// PISO DA EXPOSIÇÃO

caixa(200, 0.2, 200, material(0x242a32), 0, -0.2, 0);

// BASE DO RINGUE

caixa(7.5, 0.5, 7.5, escuro, 0, 0.25, 0);

caixa(6.7, 0.15, 6.7, branco, 0, 0.58, 0);

// CENTRO DO RINGUE

const circulo = new THREE.Mesh(
    new THREE.CircleGeometry(1.3, 48),
    material(0x303a48)
);

circulo.rotation.x = -Math.PI / 2;
circulo.position.y = 0.66;

cena.add(circulo);

// POSTES DO RINGUE

const cantos = [
    [-3.1, -3.1],
    [3.1, -3.1],
    [-3.1, 3.1],
    [3.1, 3.1]
];

cantos.forEach(([x, z]) => {

    cilindro(0.11, 2.8, dourado, x, 1.95, z);

});

// CORDAS DO RINGUE

const pontos = [
    [-3.1, -3.1],
    [3.1, -3.1],
    [3.1, 3.1],
    [-3.1, 3.1]
];

[1.2, 1.8, 2.4].forEach((altura, indice) => {

    const cor = indice === 1 ? vermelho : branco;

    const cordaMat = new THREE.MeshStandardMaterial({
        color: cor === vermelho ? 0xc62828 : 0xe8e8e8
    });

    for (let i = 0; i < 4; i++) {

        const a = pontos[i];
        const b = pontos[(i + 1) % 4];

        const inicio = new THREE.Vector3(
            a[0], altura, a[1]
        );

        const fim = new THREE.Vector3(
            b[0], altura, b[1]
        );

        const direcao = new THREE.Vector3()
            .subVectors(fim, inicio);

        const objeto = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.045,
                0.045,
                direcao.length(),
                12
            ),
            cordaMat
        );

        objeto.position.copy(inicio)
            .add(fim)
            .multiplyScalar(0.5);

        objeto.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direcao.normalize()
        );

        cena.add(objeto);
    }
});

// BOXEADORES

function criarBoxeador(x, z, roupa, luva, nome) {

    const grupo = new THREE.Group();

    grupo.position.set(x, 0.68, z);

    cena.add(grupo);

    // Corpo

    const corpo = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.34, 0.43, 0.95, 20
        ),
        roupa
    );

    corpo.position.y = 1.3;
    corpo.castShadow = true;
    grupo.add(corpo);

    // Cabeça

    const cabeca = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 24, 24),
        pele
    );

    cabeca.position.y = 1.97;
    cabeca.castShadow = true;
    grupo.add(cabeca);

    // Shorts

    const shorts = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.42, 0.38, 0.35, 20
        ),
        preto
    );

    shorts.position.y = 0.65;
    grupo.add(shorts);

    // Pernas

    [-1, 1].forEach(lado => {

        const perna = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12, 0.15, 0.65, 16
            ),
            preto
        );

        perna.position.set(lado * 0.2, 0.15, 0);
        grupo.add(perna);

    });

    // Braços e luvas

    [-1, 1].forEach(lado => {

        const braco = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12, 0.15, 0.65, 16
            ),
            pele
        );

        braco.position.set(
            lado * 0.43,
            1.47,
            0.13
        );

        braco.rotation.z = lado * 0.7;
        grupo.add(braco);

        const mao = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.23, 20, 20
            ),
            luva
        );

        mao.position.set(
            lado * 0.65,
            1.78,
            0.35
        );

        mao.userData.info =
            nome + ": atleta equipado com luvas de boxe.";

        grupo.add(mao);
    });

    grupo.userData.info =
        nome + ": representa os atletas que treinam técnica, defesa, força e velocidade.";

    return grupo;
}

criarBoxeador(
    -1.15,
    -0.45,
    vermelho,
    vermelhoLuva,
    "Boxeador vermelho"
);

criarBoxeador(
    1.15,
    0.55,
    azul,
    azulLuva,
    "Boxeador azul"
);

// SACO DE PANCADAS

const suporte = cilindro(
    0.045, 1, dourado, -4.2, 3.1, 0
);

const saco = cilindro(
    0.4, 1.65, preto, -4.2, 2.15, 0
);

saco.userData.info =
    "SACO DE PANCADAS: utilizado para treinar golpes, força, velocidade, precisão e resistência.";

// LUVA DE EXPOSIÇÃO

const luva1 = esfera(
    0.35, vermelhoLuva, 4.2, 1.1, -2
);

luva1.scale.set(1.2, 0.8, 1.4);

luva1.userData.info =
    "LUVAS: ajudam a proteger as mãos e diminuem o impacto dos golpes durante os treinos e combates.";

const luva2 = esfera(
    0.35, azulLuva, 5, 1.1, -2
);

luva2.scale.set(1.2, 0.8, 1.4);

luva2.userData.info =
    "LUVAS DE BOXE: existem modelos específicos para treinamento e competição.";

// PEDESTAL DAS LUVAS

cilindro(0.65, 0.7, dourado, 4.6, 0.35, -2);

// BANDAGENS

const bandagem = cilindro(
    0.23, 0.2, branco, 4, 0.95, 0.3
);

bandagem.rotation.x = Math.PI / 2;

bandagem.userData.info =
    "BANDAGENS: envolvem as mãos e os punhos para ajudar na proteção e sustentação.";

// PROTETOR BUCAL

const protetor = esfera(
    0.2,
    material(0xe5d5a7),
    4.9,
    0.9,
    0.5
);

protetor.scale.set(1.3, 0.4, 0.6);

protetor.userData.info =
    "PROTETOR BUCAL: ajuda a proteger os dentes e a boca durante a prática do boxe.";

// PAINÉIS DA EXPOSIÇÃO

function criarPainel(x, z, titulo, linhas) {

    const painel = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.9, 0.15),
        escuro
    );

    painel.position.set(x, 1.65, z);
    cena.add(painel);

    const canvas = document.createElement("canvas");

    canvas.width = 700;
    canvas.height = 450;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#17202b";
    ctx.fillRect(0, 0, 700, 450);

    ctx.strokeStyle = "#d5a64f";
    ctx.lineWidth = 8;
    ctx.strokeRect(5, 5, 690, 440);

    ctx.fillStyle = "#e6b75c";
    ctx.font = "bold 46px Arial";
    ctx.fillText(titulo, 35, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "27px Arial";

    linhas.forEach((linha, i) => {
        ctx.fillText(linha, 35, 165 + i * 65);
    });

    const textura = new THREE.CanvasTexture(canvas);

    const placa = new THREE.Mesh(
        new THREE.PlaneGeometry(2.65, 1.7),
        new THREE.MeshBasicMaterial({
            map: textura
        })
    );

    placa.position.set(x, 1.65, z + 0.09);
    cena.add(placa);

    placa.userData.info =
        titulo + ": " + linhas.join(" | ");

    return placa;
}

criarPainel(
    -4.5,
    -3.5,
    "HISTÓRIA",
    [
        "Raízes na Antiguidade",
        "Regras evoluíram com o tempo",
        "Prática amadora e profissional"
    ]
);

criarPainel(
    0,
    -4.5,
    "DISCIPLINA",
    [
        "Respeito e autocontrole",
        "Foco e persistência",
        "Preparo físico e mental"
    ]
);

criarPainel(
    4.5,
    3.5,
    "COMO FUNCIONA",
    [
        "Combates divididos em rounds",
        "Ataque e defesa com técnica",
        "Vitória por pontos ou nocaute"
    ]
);

// PLACA SUPERIOR

const placaTopo = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.9, 0.15),
    dourado
);

placaTopo.position.set(0, 4.1, -5.5);
cena.add(placaTopo);

const canvasTitulo = document.createElement("canvas");

canvasTitulo.width = 1200;
canvasTitulo.height = 200;

const ctxTitulo = canvasTitulo.getContext("2d");

ctxTitulo.fillStyle = "#171b22";
ctxTitulo.fillRect(0, 0, 1200, 200);

ctxTitulo.fillStyle = "#e6b75c";
ctxTitulo.font = "bold 65px Arial";
ctxTitulo.textAlign = "center";

ctxTitulo.fillText(
    "BOXE: MUITO ALÉM DA LUTA",
    600,
    120
);

const texturaTitulo = new THREE.CanvasTexture(canvasTitulo);

const titulo = new THREE.Mesh(
    new THREE.PlaneGeometry(7.8, 0.8),
    new THREE.MeshBasicMaterial({
        map: texturaTitulo
    })
);

titulo.position.set(0, 4.1, -5.4);
cena.add(titulo);

// INTERAÇÃO COM OS OBJETOS

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderizador.domElement.addEventListener("click", evento => {

    const retangulo =
        renderizador.domElement.getBoundingClientRect();

    mouse.x =
        ((evento.clientX - retangulo.left) /
        retangulo.width) * 2 - 1;

    mouse.y =
        -((evento.clientY - retangulo.top) /
        retangulo.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const objetos = raycaster.intersectObjects(
        cena.children,
        true
    );

    for (const resultado of objetos) {

        let objeto = resultado.object;

        while (objeto && !objeto.userData.info) {
            objeto = objeto.parent;
        }

        if (objeto && objeto.userData.info) {

            descricao.textContent =
                objeto.userData.info;

            return;
        }
    }
});

// BOTÃO DE REINICIAR CÂMERA

document.getElementById("resetar").addEventListener(
    "click",
    () => {

        camera.position.set(11, 9, 13);

        controles.target.set(0, 1.3, 0);

        controles.update();

        descricao.textContent =
            "Você voltou à visão inicial da exposição!";
    }
);

// AJUSTE AUTOMÁTICO DA TELA

function ajustarTela() {

    const largura = area.clientWidth;
    const altura = area.clientHeight;

    camera.aspect = largura / altura;

    camera.updateProjectionMatrix();

    renderizador.setSize(largura, altura);
}

const observador = new ResizeObserver(ajustarTela);

observador.observe(area);

// ANIMAÇÃO

function animar() {

    requestAnimationFrame(animar);

    controles.update();

    renderizador.render(cena, camera);
}

animar();

// FINALIZAÇÃO DO CARREGAMENTO

carregamento.style.display = "none";

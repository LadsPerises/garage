# Garage Forge 3D — Website

Website oficial da **Garage Forge 3D** — soluções sob medida em desenho, engenharia e impressão 3D para peças automóveis, com produção local.

## 📁 Estrutura do Projeto

O projeto foi organizado separando claramente o HTML, CSS, JavaScript e recursos visuais:

```text
garage-forge-site/
├── .openai/
│   └── hosting.json        # Configuração de alojamento estático
├── dist/                   # Diretório de publicação / webroot
│   ├── index.html          # Estrutura HTML limpa e semântica
│   ├── css/
│   │   └── style.css       # Folha de estilos unificada e comentada
│   ├── js/
│   │   └── main.js         # Lógica JavaScript modular (carrossel, menu, WhatsApp, animações)
│   └── images/             # Imagens e ficheiros de media
│       ├── hero-workshop.webp
│       ├── portfolio-bracket.webp
│       ├── portfolio-tray.webp
│       ├── portfolio-vent.webp
│       ├── project-console.webp
│       ├── project-offroad.webp
│       └── service-engineering.webp
└── README.md
```

## 🚀 Como Executar Localmente

Podes visualizar o site abrindo diretamente o ficheiro `dist/index.html` em qualquer navegador ou usando um servidor estático local:

```bash
# Com Python 3
python -m http.server 8000 --directory dist

# Com Node (npx)
npx serve dist
```

Em seguida, abre `http://localhost:8000` no navegador.

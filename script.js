document.addEventListener('DOMContentLoaded', function () {

    let itensCarrinho = [];
    let carrinhoIcon = null;
    let carrinhoBadge = null;
    let carrinhoTooltip = null;
    let carrinhoMenu = null;
    let carrinhoOverlay = null;
    let carrinhoFechar = null;
    let carrinhoItensContainer = null;
    let usuarioLogado = null;
    let redirectAposLogin = null;

    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle');
    const modeSwitch = document.querySelector('.toggle-switch');
    const modeIcon = document.querySelector('.mode .icon');
    const logoImg = document.querySelector('.sidebar .image img');
    const iconImgs = document.querySelectorAll('.icon-img');

    function atualizarMenuUsuario() {
        const bottomContent = document.querySelector('.bottom-content');
        if (!bottomContent) return;

        const loginItemExistente = document.querySelector('.login-item');
        if (loginItemExistente) {
            loginItemExistente.remove();
        }

        const loginItem = document.createElement('li');
        loginItem.className = 'login-item';

        if (usuarioLogado) {
            loginItem.innerHTML = `
                <a href="meuperfil.html" style="display: flex; align-items: center; width: 100%; text-decoration: none;">
                    <i class='bx bx-user-circle icon'></i>
                    <span class="text nav-text">${usuarioLogado.nome.split(' ')[0]}</span>
                </a>
                <div style="display: flex; gap: 5px; margin-left: auto; margin-right: 10px;">
                    <i class='bx bx-log-out icon' style="font-size: 20px; cursor: pointer;" onclick="logout()" title="Sair"></i>
                </div>
            `;
        } else {
            loginItem.innerHTML = `
                <a href="login.html" style="display: flex; align-items: center; width: 100%; text-decoration: none;">
                    <i class='bx bx-log-in icon'></i>
                    <span class="text nav-text">Entrar / Cadastrar</span>
                </a>
            `;
        }

        const modeItem = bottomContent.querySelector('.mode');
        if (modeItem) {
            bottomContent.insertBefore(loginItem, modeItem);
        }
    }

    function carregarUsuario() {
        let usuarioSalvo = localStorage.getItem('usenohl-usuario');

        if (!usuarioSalvo) {
            usuarioSalvo = sessionStorage.getItem('usenohl-usuario');
        }

        if (usuarioSalvo) {
            try {
                usuarioLogado = JSON.parse(usuarioSalvo);
            } catch (e) {
                usuarioLogado = null;
            }
        } else {
            usuarioLogado = null;
        }
        atualizarMenuUsuario();
    }

    function salvarUsuario(usuario, manterLogado = false) {
        usuarioLogado = usuario;

        if (manterLogado) {
            localStorage.setItem('usenohl-usuario', JSON.stringify(usuario));
            sessionStorage.removeItem('usenohl-usuario');
        } else {
            sessionStorage.setItem('usenohl-usuario', JSON.stringify(usuario));
            localStorage.removeItem('usenohl-usuario');
        }

        atualizarMenuUsuario();

        if (redirectAposLogin) {
            const destino = redirectAposLogin;
            redirectAposLogin = null;
            window.location.href = destino;
        }
    }

    window.logout = function () {
        usuarioLogado = null;
        localStorage.removeItem('usenohl-usuario');
        sessionStorage.removeItem('usenohl-usuario');
        atualizarMenuUsuario();
        window.location.href = 'index.html';
    };

    window.fazerLogin = function (email, senha) {
        const usuarios = JSON.parse(localStorage.getItem('usenohl-usuarios') || '[]');
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);

        if (usuario) {
            const manterLogado = document.getElementById('manter-logado')?.checked || false;
            const { senha, ...usuarioSemSenha } = usuario;
            salvarUsuario(usuarioSemSenha, manterLogado);

            if (!redirectAposLogin) {
                window.location.href = 'index.html';
            }
            return true;
        } else {
            const form = document.querySelector('.login-form');
            const erroExistente = document.querySelector('.erro-login');
            if (!erroExistente) {
                const erroMsg = document.createElement('p');
                erroMsg.className = 'erro-login';
                erroMsg.style.color = '#ff4d4d';
                erroMsg.style.marginTop = '10px';
                erroMsg.style.textAlign = 'center';
                erroMsg.textContent = 'E-mail ou senha inválidos!';
                form.appendChild(erroMsg);
                setTimeout(() => {
                    erroMsg.remove();
                }, 3000);
            }
            return false;
        }
    };

    window.fazerCadastro = function () {
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const dataNascimento = document.getElementById('data-nascimento').value;

        const cpfInput = document.getElementById('cpf').value;
        const cpf = cpfInput.replace(/\D/g, '');

        const dddDisplay = document.getElementById('ddd-display').textContent;
        const ddd = dddDisplay.replace(/[()\s]/g, '');
        const numeroTelefone = document.getElementById('telefone').value.replace(/\D/g, '');
        const telefone = ddd + numeroTelefone;

        const logradouro = document.getElementById('logradouro').value;
        const numero = document.getElementById('numero').value;
        const complemento = document.getElementById('complemento').value;
        const bairro = document.getElementById('bairro').value;
        const cidade = document.getElementById('cidade').value;
        const estado = document.getElementById('estado').value;
        const cep = document.getElementById('cep').value;
        const referencia = document.getElementById('referencia').value;

        const enderecoCompleto = `${logradouro}, ${numero}${complemento ? ' - ' + complemento : ''} - ${bairro}, ${cidade} - ${estado}${cep ? ' - CEP: ' + cep : ''}${referencia ? ' (' + referencia + ')' : ''}`;

        if (!nome || !email || !senha || !confirmPassword || !dataNascimento || !cpf || !telefone || !logradouro || !numero || !bairro || !cidade || !estado) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return false;
        }

        if (senha !== confirmPassword) {
            alert('As senhas não coincidem!');
            return false;
        }

        if (cpf.length !== 11) {
            alert('CPF inválido!');
            return false;
        }

        const termos = document.getElementById('termos').checked;
        if (!termos) {
            alert('Você precisa aceitar os termos de uso!');
            return false;
        }

        const usuarios = JSON.parse(localStorage.getItem('usenohl-usuarios') || '[]');

        if (usuarios.some(u => u.email === email)) {
            alert('E-mail já cadastrado!');
            return false;
        }

        if (usuarios.some(u => u.cpf === cpf)) {
            alert('CPF já cadastrado!');
            return false;
        }

        const novoUsuario = {
            nome,
            email,
            senha,
            dataNascimento,
            cpf,
            telefone,
            endereco: enderecoCompleto,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            cep,
            referencia,
            score: 0,
            dataCadastro: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usenohl-usuarios', JSON.stringify(usuarios));

        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        salvarUsuario(usuarioSemSenha, false);

        alert('✅ Cadastro realizado com sucesso! Seja bem-vindo(a) à UseNohl!');
        window.location.href = 'index.html';
        return true;
    };

    window.adicionarPontos = function (pontos) {
        if (!usuarioLogado) return false;

        const usuarios = JSON.parse(localStorage.getItem('usenohl-usuarios') || '[]');
        const index = usuarios.findIndex(u => u.email === usuarioLogado.email);

        if (index !== -1) {
            usuarios[index].score = (usuarios[index].score || 0) + pontos;
            localStorage.setItem('usenohl-usuarios', JSON.stringify(usuarios));

            usuarioLogado.score = usuarios[index].score;

            if (localStorage.getItem('usenohl-usuario')) {
                localStorage.setItem('usenohl-usuario', JSON.stringify(usuarioLogado));
            }
            if (sessionStorage.getItem('usenohl-usuario')) {
                sessionStorage.setItem('usenohl-usuario', JSON.stringify(usuarioLogado));
            }
            return true;
        }
        return false;
    };

    window.irParaCheckout = function () {
        if (!usuarioLogado) {
            redirectAposLogin = 'checkout.html';
            window.location.href = 'login.html';
            return false;
        }
        window.location.href = 'checkout.html';
        return true;
    };

    function salvarCarrinho() {
        localStorage.setItem('usenohl-carrinho', JSON.stringify(itensCarrinho));
    }

    function carregarCarrinho() {
        const carrinhoSalvo = localStorage.getItem('usenohl-carrinho');
        if (carrinhoSalvo) {
            try {
                itensCarrinho = JSON.parse(carrinhoSalvo);
            } catch (e) {
                itensCarrinho = [];
            }
        } else {
            itensCarrinho = [];
        }
    }

    function salvarTema(isDark) {
        localStorage.setItem('usenohl-tema', isDark ? 'dark' : 'light');
    }

    function carregarTema() {
        const temaSalvo = localStorage.getItem('usenohl-tema');
        if (temaSalvo === null) {
            return document.body.classList.contains('dark');
        }
        const isDark = temaSalvo === 'dark';
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        return isDark;
    }

    function salvarEstadoMenu(recolhido) {
        localStorage.setItem('usenohl-menu', recolhido ? 'closed' : 'open');
    }

    function carregarEstadoMenu() {
        const menuSalvo = localStorage.getItem('usenohl-menu');
        if (menuSalvo === null) {
            return false;
        }
        return menuSalvo === 'closed';
    }

    function updateIconsForMode(isDark) {
        iconImgs.forEach(img => {
            if (isDark) {
                img.src = img.getAttribute('data-dark');
            } else {
                img.src = img.getAttribute('data-light');
            }
        });

        const carrinhoIconElem = document.querySelector('.carrinho-icon');
        if (carrinhoIconElem) {
            if (isDark) {
                carrinhoIconElem.src = carrinhoIconElem.getAttribute('data-dark');
            } else {
                carrinhoIconElem.src = carrinhoIconElem.getAttribute('data-light');
            }
        }
    }

    window.alternarTema = function () {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');

        if (isDark) {
            modeIcon?.classList.remove('bx-sun');
            modeIcon?.classList.add('bx-moon');
            if (logoImg) logoImg.src = 'logo-branca.png';
        } else {
            modeIcon?.classList.remove('bx-moon');
            modeIcon?.classList.add('bx-sun');
            if (logoImg) logoImg.src = 'logo.png';
        }

        updateIconsForMode(isDark);
        salvarTema(isDark);
    };

    function criarMenuCarrinho() {
        const overlay = document.createElement('div');
        overlay.className = 'carrinho-overlay';
        document.body.appendChild(overlay);

        const menuHTML = `
            <div class="carrinho-menu">
                <div class="carrinho-header">
                    <h3>
                        <i class='bx bx-shopping-bag'></i>
                        Meu carrinho
                    </h3>
                    <div class="carrinho-fechar">
                        <i class='bx bx-x'></i>
                    </div>
                </div>
                <div class="carrinho-itens"></div>
                <div class="carrinho-footer">
                    <button class="carrinho-finalizar" onclick="irParaCheckout()">FINALIZAR COMPRA</button>
                    <a class="continuar-comprando" onclick="fecharCarrinho()">
                        <i class='bx bx-arrow-back'></i>
                        Continuar comprando
                    </a>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    criarMenuCarrinho();

    carrinhoIcon = document.querySelector('.carrinho-icon');
    carrinhoBadge = document.querySelector('.carrinho-badge');
    carrinhoTooltip = document.querySelector('.carrinho-tooltip');
    carrinhoMenu = document.querySelector('.carrinho-menu');
    carrinhoOverlay = document.querySelector('.carrinho-overlay');
    carrinhoFechar = document.querySelector('.carrinho-fechar');
    carrinhoItensContainer = document.querySelector('.carrinho-itens');

    window.abrirCarrinho = function () {
        if (carrinhoMenu && carrinhoOverlay) {
            carrinhoMenu.classList.add('aberto');
            carrinhoOverlay.classList.add('ativo');
            atualizarCarrinhoDisplay();
        }
    };

    window.fecharCarrinho = function () {
        if (carrinhoMenu && carrinhoOverlay) {
            carrinhoMenu.classList.remove('aberto');
            carrinhoOverlay.classList.remove('ativo');
        }
    };

    function atualizarTooltip() {
        if (!carrinhoTooltip || !carrinhoBadge) return;

        const totalItens = itensCarrinho.reduce((acc, item) => acc + (item.quantidade || 1), 0);

        if (totalItens === 0) {
            carrinhoTooltip.textContent = 'Carrinho vazio';
        } else if (totalItens === 1) {
            carrinhoTooltip.textContent = '1 item no carrinho';
        } else {
            carrinhoTooltip.textContent = `${totalItens} itens no carrinho`;
        }

        carrinhoBadge.textContent = totalItens;
    }

    function calcularSubtotal() {
        return itensCarrinho.reduce((acc, item) => acc + ((item.preco || 0) * (item.quantidade || 1)), 0);
    }

    function atualizarCarrinhoDisplay() {
        if (!carrinhoItensContainer) return;

        atualizarTooltip();

        if (itensCarrinho.length === 0) {
            carrinhoItensContainer.innerHTML = `
                <div class="carrinho-vazio">
                    <i class='bx bx-shopping-bag'></i>
                    <p>Seu carrinho está vazio</p>
                    <p style="font-size: 14px; margin-top: 10px;">Adicione produtos para continuar</p>
                </div>
            `;
            return;
        }

        let html = '';
        const subtotal = calcularSubtotal();

        itensCarrinho.forEach((item, index) => {
            html += `
                <div class="carrinho-item-principal">
                    <div class="carrinho-item-header">
                        <span class="vendedor-info">
                            <i class='bx bx-store'></i>
                            Vendido por: <strong>UseNohl</strong>
                        </span>
                    </div>
                    
                    <div class="carrinho-item-produto">
                        <img src="${item.imagem || ''}" alt="${item.nome || 'Produto'}" class="produto-imagem-carrinho">
                        <div class="produto-detalhes">
                            <div class="produto-nome-carrinho">${item.nome || 'Produto'}</div>
                            <div class="produto-descricao">${item.descricao || 'Produto de alta qualidade'}</div>
                            <div class="produto-preco-carrinho">R$ ${(item.preco || 0).toFixed(2)}</div>
                            <div class="preco-pix-carrinho">À vista no PIX</div>
                        </div>
                    </div>

                    <div class="carrinho-item-quantidade">
                        <div class="quantidade-controles">
                            <button class="quantidade-btn" onclick="alterarQuantidade(${index}, -1)">−</button>
                            <span class="quantidade-valor">${item.quantidade || 1}</span>
                            <button class="quantidade-btn" onclick="alterarQuantidade(${index}, 1)">+</button>
                        </div>
                        <div class="item-remover" onclick="removerItem(${index})">
                            <i class='bx bx-trash'></i>
                            Remover
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            <div class="carrinho-servicos">
                <div class="servicos-titulo">
                    <i class='bx bx-package'></i>
                    SERVIÇOS
                </div>
                <div class="servico-item">
                    <div class="servico-info">
                        <div class="servico-nome">Garantia Estendida</div>
                        <div class="servico-desc">12 meses adicionais</div>
                    </div>
                    <div class="servico-preco">
                        R$ 29,90
                        <small>à vista no PIX</small>
                    </div>
                </div>
                <div class="servico-item">
                    <div class="servico-info">
                        <div class="servico-nome">Embalagem para presente</div>
                        <div class="servico-desc">Embalagem especial</div>
                    </div>
                    <div class="servico-preco">
                        R$ 9,90
                        <small>à vista no PIX</small>
                    </div>
                </div>
            </div>

            <div class="carrinho-subtotal">
                <div class="subtotal-linha">
                    <span>Subtotal dos produtos:</span>
                    <span class="subtotal-valor">R$ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="subtotal-linha">
                    <span>À vista no PIX</span>
                    <span class="subtotal-valor">R$ ${(subtotal * 0.95).toFixed(2)}</span>
                </div>
            </div>
        `;

        carrinhoItensContainer.innerHTML = html;
    }

    window.adicionarAoCarrinho = function (produto) {
        if (!produto || !produto.nome) return;

        const itemExistente = itensCarrinho.find(item => item.nome === produto.nome);

        if (itemExistente) {
            itemExistente.quantidade = (itemExistente.quantidade || 1) + 1;
        } else {
            itensCarrinho.push({
                ...produto,
                quantidade: 1
            });
        }

        salvarCarrinho();
        atualizarCarrinhoDisplay();

        if (carrinhoIcon) {
            carrinhoIcon.style.transform = 'scale(1.2) rotate(-5deg)';
            setTimeout(() => {
                carrinhoIcon.style.transform = 'scale(1) rotate(0)';
            }, 200);
        }

        if (carrinhoBadge) {
            carrinhoBadge.style.transform = 'scale(1.2)';
            setTimeout(() => {
                carrinhoBadge.style.transform = 'scale(1)';
            }, 200);
        }
    };

    window.alterarQuantidade = function (index, delta) {
        if (!itensCarrinho[index]) return;

        const item = itensCarrinho[index];
        item.quantidade = (item.quantidade || 1) + delta;

        if (item.quantidade <= 0) {
            itensCarrinho.splice(index, 1);
        }

        salvarCarrinho();
        atualizarCarrinhoDisplay();
    };

    window.removerItem = function (index) {
        itensCarrinho.splice(index, 1);
        salvarCarrinho();
        atualizarCarrinhoDisplay();
    };

    if (carrinhoIcon && !window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
        carrinhoIcon.addEventListener('click', abrirCarrinho);
    } else if (carrinhoIcon) {
        carrinhoIcon.style.pointerEvents = 'none';
    }

    if (carrinhoFechar) {
        carrinhoFechar.addEventListener('click', fecharCarrinho);
    }

    if (carrinhoOverlay) {
        carrinhoOverlay.addEventListener('click', fecharCarrinho);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && carrinhoMenu && carrinhoMenu.classList.contains('aberto')) {
            fecharCarrinho();
        }
    });

    function configurarFavoritos() {
        const favoritos = document.querySelectorAll('.produto-favorito');
        favoritos.forEach(fav => {
            fav.removeEventListener('click', handleFavoritoClick);
            fav.addEventListener('click', handleFavoritoClick);
        });
    }

    function handleFavoritoClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const fav = this;
        const icon = fav.querySelector('i');

        if (icon.classList.contains('bx-heart')) {
            icon.classList.remove('bx-heart');
            icon.classList.add('bxs-heart');
            fav.classList.add('ativo');

            fav.style.transform = 'scale(1.2)';
            setTimeout(() => {
                fav.style.transform = 'scale(1)';
            }, 200);
        } else {
            icon.classList.remove('bxs-heart');
            icon.classList.add('bx-heart');
            fav.classList.remove('ativo');
        }
    }

    function configurarBotoesCompra() {
        const botoesCard = document.querySelectorAll('.btn-comprar-card');
        botoesCard.forEach(botao => {
            botao.addEventListener('click', function (e) {
                e.preventDefault();

                const card = this.closest('.produto-card, .destaque-card');
                if (!card) return;

                const nomeElem = card.querySelector('.produto-nome') || card.querySelector('h4');
                const precoElem = card.querySelector('.preco-atual');
                const imagemElem = card.querySelector('.produto-imagem') || card.querySelector('.destaque-imagem img');

                const produto = {
                    nome: nomeElem ? nomeElem.textContent.trim() : 'Produto',
                    preco: precoElem ? parseFloat(precoElem.textContent.replace('R$', '').replace(',', '.').trim()) || 0 : 0,
                    imagem: imagemElem ? imagemElem.src : '',
                    descricao: 'Produto de alta qualidade'
                };

                adicionarAoCarrinho(produto);
            });
        });
    }

    function init() {
        carregarUsuario();
        carregarCarrinho();

        if (window.location.href.includes('checkout.html')) {
            if (!usuarioLogado) {
                redirectAposLogin = 'checkout.html';
                window.location.href = 'login.html';
            }
        }

        const isDark = carregarTema();

        if (isDark) {
            modeIcon?.classList.remove('bx-sun');
            modeIcon?.classList.add('bx-moon');
            if (logoImg) logoImg.src = 'logo-branca.png';
        } else {
            modeIcon?.classList.remove('bx-moon');
            modeIcon?.classList.add('bx-sun');
            if (logoImg) logoImg.src = 'logo.png';
        }

        updateIconsForMode(isDark);

        if (toggleBtn) {
            const menuRecolhido = carregarEstadoMenu();
            if (menuRecolhido) {
                sidebar.classList.add('close');
            }

            toggleBtn.addEventListener('click', function () {
                sidebar.classList.toggle('close');
                const recolhido = sidebar.classList.contains('close');
                salvarEstadoMenu(recolhido);
            });
        }

        if (modeSwitch) {
            modeSwitch.addEventListener('click', alternarTema);
        }

        configurarBotoesCompra();
        configurarFavoritos();
        atualizarCarrinhoDisplay();
    }

    init();
});
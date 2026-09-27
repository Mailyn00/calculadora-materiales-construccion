
document.addEventListener('DOMContentLoaded', function () {

  const CLAVE_USUARIOS = 'construcalc_usuarios';
  const CLAVE_SESION = 'construcalc_sesion';


  const obtenerUsuarios = () => JSON.parse(localStorage.getItem(CLAVE_USUARIOS) || '[]');
  const guardarUsuarios = (u) => localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(u));

  function registrarUsuario(usuario, password, rol) {
    const usuarios = obtenerUsuarios();
    if (usuarios.some(u => u.usuario.toLowerCase() === usuario.toLowerCase())) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya existe. Elige otro.' };
    }
    usuarios.push({ usuario, password, rol });
    guardarUsuarios(usuarios);
    return { ok: true };
  }

  const validarLogin = (usuario, password) => obtenerUsuarios().find(
    u => u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === password
  );

  const iniciarSesion = (u) => sessionStorage.setItem(CLAVE_SESION, JSON.stringify(u));
  const obtenerSesion = () => JSON.parse(sessionStorage.getItem(CLAVE_SESION) || 'null');

  function mostrarSesionEnHeader(u) {
    document.getElementById('saludo-usuario').textContent = 'Hola, ' + u.usuario + ' (' + u.rol + ')';
    document.getElementById('app-header').classList.remove('oculto');
  }

  function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_SESION);
    document.getElementById('app-header').classList.add('oculto');
    document.getElementById('form-login').reset();
    mostrarVista('view-login');
  }


  function mostrarVista(idVista) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('oculto'));
    document.getElementById(idVista).classList.remove('oculto');
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-target]');
    if (el) mostrarVista(el.dataset.target);
  });

  document.getElementById('ir-a-registro').onclick = () => mostrarVista('view-registro');
  document.getElementById('ir-a-login').onclick = () => mostrarVista('view-login');
  document.getElementById('btn-salir-header').onclick = cerrarSesion;
  document.getElementById('btn-salir-dashboard').onclick = cerrarSesion;

  const calcularSuperficie = (base, altura) => base * altura;
  const calcularVolumen = (base, altura, profundidad) => base * altura * profundidad;
  const num = (v) => Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 });


  const CALCULOS = [
    {
      id: 'muro', numero: 1, titulo: 'Muro de ladrillo',
      desc: 'Ingresa el espesor del muro y sus medidas.',
      campos: [
        { id: 'espesor', label: 'Espesor del muro', tipo: 'select', opciones: [['20', '20 cm'], ['30', '30 cm']] },
        { id: 'largo', label: 'Largo (m)' },
        { id: 'alto', label: 'Alto (m)' }
      ],
      calcular: (v) => {
        const sup = calcularSuperficie(v.largo, v.alto);
        const tasa = v.espesor === '30' ? { c: 15.2, a: 0.115, l: 120 } : { c: 10.9, a: 0.09, l: 90 };
        return [
          ['Superficie del muro', num(sup) + ' m²'],
          ['Cemento', num(sup * tasa.c) + ' kg'],
          ['Arena', num(sup * tasa.a) + ' m³'],
          ['Ladrillos', Math.ceil(sup * tasa.l) + ' u.']
        ];
      }
    },
    {
      id: 'viga', numero: 2, titulo: 'Viga de hormigón',
      desc: 'Ingresa el largo total de la viga.',
      campos: [{ id: 'largo', label: 'Largo de la viga (m)' }],
      calcular: (v) => [
        ['Cemento', num(v.largo * 9) + ' kg'],
        ['Arena', num(v.largo * 0.02) + ' m³'],
        ['Piedra', num(v.largo * 0.02) + ' m²'],
        ['Hierro del 8', num(v.largo * 4) + ' m'],
        ['Hierro del 4', num(v.largo * 3) + ' m']
      ]
    },
    {
      id: 'columna', numero: 3, titulo: 'Columnas de hormigón',
      desc: 'Ingresa el largo total de la columna.',
      campos: [{ id: 'largo', label: 'Largo de la columna (m)' }],
      calcular: (v) => [
        ['Cemento', num(v.largo * 7.5) + ' kg'],
        ['Arena', num(v.largo * 0.016) + ' m³'],
        ['Piedra', num(v.largo * 0.016) + ' m²'],
        ['Hierro del 10', num(v.largo * 6) + ' m'],
        ['Hierro del 4', num(v.largo * 3) + ' m']
      ]
    },
    {
      id: 'contrapiso', numero: 4, titulo: 'Contrapisos',
      desc: 'Ingresa el espesor, el ancho y el largo del contrapiso.',
      campos: [{ id: 'espesor', label: 'Espesor (m)' }, { id: 'ancho', label: 'Ancho (m)' }, { id: 'largo', label: 'Largo (m)' }],
      calcular: (v) => {
        const vol = calcularVolumen(v.espesor, v.ancho, v.largo);
        return [
          ['Volumen de contrapiso', num(vol) + ' m³'],
          ['Cemento', num(vol * 105) + ' kg'],
          ['Arena', num(vol * 0.45) + ' m³'],
          ['Piedra', num(vol * 0.9) + ' m³']
        ];
      }
    },
    {
      id: 'techo', numero: 5, titulo: 'Techo',
      desc: 'Ingresa el espesor, el ancho y el largo del techo.',
      campos: [{ id: 'espesor', label: 'Espesor (m)' }, { id: 'ancho', label: 'Ancho (m)' }, { id: 'largo', label: 'Largo (m)' }],
      calcular: (v) => {
        const sup = calcularSuperficie(v.ancho, v.largo);
        return [
          ['Espesor considerado', num(v.espesor) + ' m'],
          ['Superficie del techo', num(sup) + ' m²'],
          ['Cemento', num(sup * 33) + ' kg'],
          ['Arena', num(sup * 0.072) + ' m³'],
          ['Piedra', num(sup * 0.072) + ' m³'],
          ['Hierro del 8', num(sup * 7) + ' m'],
          ['Hierro del 6', num(sup * 4) + ' m']
        ];
      }
    },
    {
      id: 'piso', numero: 6, titulo: 'Pisos',
      desc: 'Ingresa el ancho y el largo del paño de piso a colocar.',
      campos: [{ id: 'ancho', label: 'Ancho (m)' }, { id: 'largo', label: 'Largo (m)' }],
      calcular: (v) => {
        const sup = calcularSuperficie(v.ancho, v.largo);
        return [
          ['Superficie del paño', num(sup) + ' m²'],
          ['Superficie + 10% de recorte', num(sup * 1.10) + ' m²']
        ];
      }
    },
    {
      id: 'pintura', numero: 7, titulo: 'Pintura',
      desc: 'Ingresa la superficie del muro a pintar.',
      campos: [{ id: 'superficie', label: 'Superficie del muro (m²)' }],
      calcular: (v) => [
        ['Superficie a pintar', num(v.superficie) + ' m²'],
        ['Pintura necesaria', num(v.superficie / 6) + ' litros']
      ]
    }
  ];

  const campoHTML = (c) => c.tipo === 'select'
    ? `<label class="campo"><span class="campo__etiqueta">${c.label}</span>
         <select data-campo="${c.id}" required>${c.opciones.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`
    : `<label class="campo"><span class="campo__etiqueta">${c.label}</span>
         <input type="number" data-campo="${c.id}" min="0" step="0.01" required></label>`;

  const contenedorVistas = document.getElementById('calc-views');

  CALCULOS.forEach(function (c) {
    // Tarjeta en el menú principal (siempre antes de la tarjeta "Salir", para que quede última)
    document.getElementById('tarjeta-salir').insertAdjacentHTML('beforebegin', `
      <article class="tarjeta-item" data-target="view-${c.id}">
        <!-- ICONO: assets/images/icon-${c.id}.png -->
        <img src="assets/images/icon-${c.id}.png" alt="" class="tarjeta-item__icono">
        <h3 class="tarjeta-item__titulo">${c.numero}. ${c.titulo}</h3>
        <p class="tarjeta-item__desc">${c.desc}</p>
        <button type="button" class="btn btn--secundario">Calcular <span class="flecha">→</span></button>
      </article>`);

    contenedorVistas.insertAdjacentHTML('beforeend', `
      <section id="view-${c.id}" class="view view--calc oculto">
        <div class="contenedor contenedor--angosto">
          <button type="button" class="btn btn--volver" data-target="view-dashboard">← Volver al menú</button>
          <h1 class="titulo-seccion">${c.titulo}</h1>
          <p class="texto-muted">${c.desc}</p>
          <form class="formulario formulario--calc" novalidate>
            ${c.campos.map(campoHTML).join('')}
            <button type="submit" class="btn btn--primario">Calcular materiales <span class="flecha">→</span></button>
          </form>
          <div class="resultado oculto"></div>
        </div>
      </section>`);

    const vista = document.getElementById('view-' + c.id);
    vista.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      const valores = {};
      c.campos.forEach(function (campo) {
        const el = vista.querySelector('[data-campo="' + campo.id + '"]');
        valores[campo.id] = campo.tipo === 'select' ? el.value : parseFloat(el.value);
      });
      const resultado = vista.querySelector('.resultado');
      resultado.innerHTML = '<h3>Materiales necesarios</h3><table>' +
        c.calcular(valores).map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('') + '</table>';
      resultado.classList.remove('oculto');
    });
  });

  document.getElementById('form-registro').addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('registro-usuario').value.trim();
    const password = document.getElementById('registro-password').value;
    const rol = document.getElementById('registro-rol').value;
    const errorEl = document.getElementById('registro-error');
    const exitoEl = document.getElementById('registro-exito');
    errorEl.classList.add('oculto');
    exitoEl.classList.add('oculto');

    if (!usuario || !password || !rol) {
      errorEl.textContent = 'Completa usuario, contraseña y perfil.';
      errorEl.classList.remove('oculto');
      return;
    }
    const resultado = registrarUsuario(usuario, password, rol);
    if (!resultado.ok) {
      errorEl.textContent = resultado.mensaje;
      errorEl.classList.remove('oculto');
      return;
    }
    exitoEl.textContent = 'Cuenta creada. Ya puedes iniciar sesión.';
    exitoEl.classList.remove('oculto');
    this.reset();
    setTimeout(() => mostrarVista('view-login'), 900);
  });

  document.getElementById('form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('login-usuario').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const encontrado = validarLogin(usuario, password);
    if (!encontrado) {
      errorEl.textContent = 'Usuario o contraseña incorrectos.';
      errorEl.classList.remove('oculto');
      return;
    }
    errorEl.classList.add('oculto');
    iniciarSesion(encontrado);
    mostrarSesionEnHeader(encontrado);
    this.reset();
    mostrarVista('view-dashboard');
  });

  const sesionActiva = obtenerSesion();
  if (sesionActiva) {
    mostrarSesionEnHeader(sesionActiva);
    mostrarVista('view-dashboard');
  } else {
    mostrarVista('view-login');
  }

});
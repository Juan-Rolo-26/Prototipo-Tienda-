<?php
$brand = [
  'name' => 'Lumbre Mate Co.',
  'tagline' => 'Ritual moderno del mate, hecho para marcas que quieren vender.',
  'kicker' => 'Prototipo e-commerce premium',
  'cta_primary' => 'Ver colección',
  'cta_secondary' => 'Solicitar tu tienda',
  'accent' => '#D39B5F',
  'hero_image' => 'assets/img/hero-mate.svg',
  'email' => 'hola@lumbremate.com',
  'instagram' => '@lumbremate',
];

$categories = [
  [ 'name' => 'Mates', 'desc' => 'Calabaza, acero, cerámica y vidrio.', 'count' => 18 ],
  [ 'name' => 'Termos', 'desc' => 'Calor perfecto por horas.', 'count' => 12 ],
  [ 'name' => 'Bombillas', 'desc' => 'Acero, alpaca y doradas.', 'count' => 16 ],
  [ 'name' => 'Bolsos', 'desc' => 'Porta mate y termos.', 'count' => 9 ],
  [ 'name' => 'Yerba & Contenedores', 'desc' => 'Latas y frascos herméticos.', 'count' => 7 ],
];

$products = [
  [ 'name' => 'Mate Aurora', 'price' => 18900, 'category' => 'Mates', 'badge' => 'Nuevo', 'desc' => 'Doble pared de cerámica, tacto cálido.', 'tone' => 'sand' ],
  [ 'name' => 'Termo Eclipse 1L', 'price' => 45900, 'category' => 'Termos', 'badge' => 'Best seller', 'desc' => 'Acero 304, 24h de temperatura.', 'tone' => 'graphite' ],
  [ 'name' => 'Bombilla Nativa', 'price' => 9900, 'category' => 'Bombillas', 'badge' => 'Limited', 'desc' => 'Alpaca pulida con filtro fino.', 'tone' => 'brass' ],
  [ 'name' => 'Bolso Calma', 'price' => 23900, 'category' => 'Bolsos', 'badge' => 'Eco', 'desc' => 'Tela reciclada y costuras premium.', 'tone' => 'olive' ],
  [ 'name' => 'Contenedor Yerba 1.2kg', 'price' => 12900, 'category' => 'Yerba & Contenedores', 'badge' => 'Hermético', 'desc' => 'Sellado de silicona anti humedad.', 'tone' => 'clay' ],
  [ 'name' => 'Kit Ritual Lumbre', 'price' => 69900, 'category' => 'Kits', 'badge' => 'Regalo', 'desc' => 'Mate + termo + bombilla premium.', 'tone' => 'stone' ],
];

$testimonials = [
  [ 'name' => 'Alma Studio', 'role' => 'Marca de lifestyle', 'text' => '“Necesitábamos una tienda con estética editorial y resultados reales. Este prototipo nos ayudó a cerrar clientes en 2 semanas.”' ],
  [ 'name' => 'Río Norte', 'role' => 'Branding & retail', 'text' => '“El layout es limpio, elegante y pensado para convertir. Nuestros productos se lucen.”' ],
  [ 'name' => 'Casa Dorada', 'role' => 'Regalos corporativos', 'text' => '“La navegación es rápida y la ficha de producto transmite calidad.”' ],
];

$benefits = [
  [ 'title' => 'Diseño escalable', 'text' => 'Listo para sumar nuevas marcas, colores y líneas de producto sin tocar el layout.' ],
  [ 'title' => 'Storytelling de marca', 'text' => 'Secciones que cuentan el ritual y elevan la percepción de valor.' ],
  [ 'title' => 'Conversión primero', 'text' => 'CTA claros, jerarquía visual y fichas de producto enfocadas en decisión.' ],
];

$featured = array_slice($products, 0, 3);
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?php echo $brand['name']; ?> — Tienda de mate premium</title>
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <div class="logo">
        <span class="dot"></span>
        <span class="wordmark"><?php echo $brand['name']; ?></span>
      </div>
      <nav class="menu">
        <a href="#inicio">Inicio</a>
        <a href="#productos">Productos</a>
        <a href="#sobre">Sobre nosotros</a>
        <a href="#local">Local Nueva Córdoba</a>
        <a href="#contacto">Contacto</a>
        <a href="#faq">Preguntas frecuentes</a>
      </nav>
      <div class="nav-actions">
        <button class="ghost">Iniciar sesión</button>
        <button class="primary">Carrito (2)</button>
      </div>
    </div>
  </header>

  <main>
    <section id="inicio" class="hero">
      <div class="container hero-grid">
        <div class="hero-copy" data-reveal>
          <p class="kicker" data-reveal><?php echo $brand['kicker']; ?></p>
          <h1 data-reveal>El mate como experiencia, no como producto.</h1>
          <p class="lead" data-reveal><?php echo $brand['tagline']; ?></p>
          <div class="hero-cta" data-reveal>
            <a class="primary" href="#productos"><?php echo $brand['cta_primary']; ?></a>
            <a class="secondary" href="#contacto"><?php echo $brand['cta_secondary']; ?></a>
          </div>
          <div class="hero-stats" data-reveal>
            <div>
              <span class="stat">+120%</span>
              <span class="stat-label">Crecimiento en ventas</span>
            </div>
            <div>
              <span class="stat">48h</span>
              <span class="stat-label">Implementación promedio</span>
            </div>
            <div>
              <span class="stat">5.0</span>
              <span class="stat-label">Satisfacción de clientes</span>
            </div>
          </div>
        </div>
        <div class="hero-visual" data-reveal>
          <img src="<?php echo $brand['hero_image']; ?>" alt="Kit de mate premium" />
          <div class="floating-card pulse">
            <p class="card-title">Kit Ritual</p>
            <p class="card-desc">Todo en un solo pack, listo para regalar.</p>
            <span class="card-price">$ 69.900</span>
          </div>
        </div>
      </div>
    </section>

    <section class="intro-image" data-reveal>
      <div class="container">
        <div class="intro-frame">
          <img src="assets/img/2-slide-1747770029258-8167025039-b81c2bdb92c10d4350e685c17b20ef7a1747770030-1920-1920.webp" alt="Mate premium en escena" />
        </div>
      </div>
    </section>

    <section id="beneficios" class="benefits">
      <div class="container grid-3">
        <?php foreach ($benefits as $benefit): ?>
          <div class="benefit-card" data-reveal>
            <h3><?php echo $benefit['title']; ?></h3>
            <p><?php echo $benefit['text']; ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <section id="productos" class="collection">
      <div class="container">
        <div class="section-head" data-reveal>
          <div>
            <p class="kicker">Selección curada</p>
            <h2>Productos estrella del ritual</h2>
          </div>
          <button class="ghost">Ver todo</button>
        </div>
        <div class="product-grid">
          <?php foreach ($products as $product): ?>
            <article class="product-card" data-category="<?php echo $product['category']; ?>" data-reveal>
              <div class="product-visual tone-<?php echo $product['tone']; ?>">
                <span class="badge"><?php echo $product['badge']; ?></span>
                <div class="product-shape"></div>
              </div>
              <div class="product-info">
                <div class="product-meta">
                  <span><?php echo $product['category']; ?></span>
                  <span>$ <?php echo number_format($product['price'], 0, ',', '.'); ?></span>
                </div>
                <h3><?php echo $product['name']; ?></h3>
                <p><?php echo $product['desc']; ?></p>
                <button class="primary">Agregar al carrito</button>
              </div>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <section id="categorias" class="categories">
      <div class="container">
        <div class="section-head" data-reveal>
          <div>
            <p class="kicker">Explorá por línea</p>
            <h2>Categorías diseñadas para crecer</h2>
          </div>
          <div class="filter" id="categoryFilter"></div>
        </div>
        <div class="category-grid">
          <?php foreach ($categories as $category): ?>
            <div class="category-card" data-reveal>
              <h3><?php echo $category['name']; ?></h3>
              <p><?php echo $category['desc']; ?></p>
              <span><?php echo $category['count']; ?> productos</span>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <section id="sobre" class="brand-story">
      <div class="container story-grid">
        <div data-reveal>
          <p class="kicker">Nuestra historia</p>
          <h2>El mate como lenguaje de comunidad</h2>
          <p class="lead">Creamos rituales estéticos que se ven premium y se sienten cercanos. Esta tienda es un punto de partida modular para marcas que quieren vender más, sin perder identidad.</p>
          <div class="story-points">
            <div>
              <h4>Paleta adaptable</h4>
              <p>Variables de color listas para rebrand en minutos.</p>
            </div>
            <div>
              <h4>Copy persuasivo</h4>
              <p>Texto real que cuenta una historia y convierte.</p>
            </div>
            <div>
              <h4>UX enfocada</h4>
              <p>Jerarquía visual clara, navegación rápida.</p>
            </div>
          </div>
        </div>
        <div class="story-visual" data-reveal>
          <div class="stack-card">
            <p>“Diseñado para marcas con visión y ambición.”</p>
            <span>Equipo creativo Lumbre</span>
          </div>
          <div class="story-image"></div>
        </div>
      </div>
    </section>

    <section class="testimonials">
      <div class="container">
        <div class="section-head" data-reveal>
          <div>
            <p class="kicker">Clientes felices</p>
            <h2>Lo que dicen otras marcas</h2>
          </div>
          <button class="ghost">Ver casos</button>
        </div>
        <div class="testimonial-grid">
          <?php foreach ($testimonials as $testimonial): ?>
            <div class="testimonial-card" data-reveal>
              <p><?php echo $testimonial['text']; ?></p>
              <div class="testimonial-meta">
                <span><?php echo $testimonial['name']; ?></span>
                <span><?php echo $testimonial['role']; ?></span>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <section id="local" class="local">
      <div class="container local-grid">
        <div data-reveal>
          <p class="kicker">Local físico</p>
          <h2>Estamos en Nueva Córdoba</h2>
          <p class="lead">Vení a vivir el ritual. Probá aromas, texturas y combinaciones en nuestro showroom.</p>
          <div class="local-details">
            <div>
              <h4>Dirección</h4>
              <p>Av. Vélez Sarsfield 901, Nueva Córdoba</p>
            </div>
            <div>
              <h4>Horarios</h4>
              <p>Lunes a Sábado · 10:00 a 20:30</p>
            </div>
            <div>
              <h4>Experiencias</h4>
              <p>Degustaciones, kits personalizados y regalos corporativos.</p>
            </div>
          </div>
          <button class="primary">Cómo llegar</button>
        </div>
        <div class="local-visual" data-reveal>
          <div class="map-card">
            <h3>Mapa interactivo</h3>
            <p>Ubicación estratégica a 5 min del Buen Pastor.</p>
            <div class="map-placeholder"></div>
          </div>
        </div>
      </div>
    </section>

    <section id="contacto" class="cta">
      <div class="container cta-grid">
        <div data-reveal>
          <p class="kicker">¿Listos para vender?</p>
          <h2>Tu marca merece una tienda que convierta.</h2>
          <p class="lead">Personalizamos colores, tipografías y catálogo en días. Este prototipo es el punto de partida para tu próxima tienda de mates.</p>
          <div class="cta-actions">
            <button class="primary">Agendar demo</button>
            <button class="secondary">Descargar propuesta</button>
          </div>
        </div>
        <form class="cta-form" data-reveal>
          <label>
            Nombre y apellido
            <input type="text" placeholder="Ej: Sofía Méndez" />
          </label>
          <label>
            Email de trabajo
            <input type="email" placeholder="hola@marca.com" />
          </label>
          <label>
            Presupuesto estimado
            <select>
              <option>$300 - $600</option>
              <option>$600 - $1.200</option>
              <option>$1.200 - $2.500</option>
              <option>$2.500+</option>
            </select>
          </label>
          <button class="primary" type="submit">Enviar solicitud</button>
        </form>
      </div>
    </section>

    <section id="faq" class="faq">
      <div class="container">
        <div class="section-head" data-reveal>
          <div>
            <p class="kicker">Dudas comunes</p>
            <h2>Preguntas frecuentes</h2>
          </div>
          <button class="ghost">Hablar con ventas</button>
        </div>
        <div class="faq-grid">
          <details class="faq-item" open data-reveal>
            <summary>¿Cuánto tardan en personalizar una tienda?</summary>
            <p>Entre 3 y 7 días hábiles. Ajustamos catálogo, paleta, tipografías y textos según tu marca.</p>
          </details>
          <details class="faq-item" data-reveal>
            <summary>¿Se puede adaptar a más productos además de mate?</summary>
            <p>Sí, el layout es modular. Se adapta perfecto a accesorios, regalos corporativos o líneas estacionales.</p>
          </details>
          <details class="faq-item" data-reveal>
            <summary>¿Incluye integración con pagos?</summary>
            <p>Es un prototipo visual listo para presentar. Podemos sumar pasarelas de pago en una segunda etapa.</p>
          </details>
          <details class="faq-item" data-reveal>
            <summary>¿Puedo usar mi propio dominio y hosting?</summary>
            <p>Totalmente. Preparamos el deploy en tu hosting o en nuestro stack recomendado.</p>
          </details>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <div class="logo">
          <span class="dot"></span>
          <span class="wordmark"><?php echo $brand['name']; ?></span>
        </div>
        <p>Prototipo e-commerce para marcas de mate. Personalizable en paleta, copy y catálogo.</p>
      </div>
      <div>
        <h4>Contacto</h4>
        <p><?php echo $brand['email']; ?></p>
        <p><?php echo $brand['instagram']; ?></p>
      </div>
      <div>
        <h4>Enlaces</h4>
        <a href="#productos">Productos</a>
        <a href="#sobre">Sobre nosotros</a>
        <a href="#local">Local Nueva Córdoba</a>
        <a href="#faq">Preguntas frecuentes</a>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© 2026 <?php echo $brand['name']; ?>. Todos los derechos reservados.</span>
      <span>Hecho con pasión por el mate.</span>
    </div>
  </footer>

  <script src="assets/js/app.js"></script>
</body>
</html>

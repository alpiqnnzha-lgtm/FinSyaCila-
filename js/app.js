(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Starfield ---------------- */
  var canvas = document.getElementById('starfield');
  var ctx = canvas.getContext('2d');
  var stars = [];
  var W, H;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
  }

  function makeStars(){
    var count = Math.min(160, Math.floor((W*H)/22000));
    stars = [];
    for(var i=0;i<count;i++){
      stars.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: Math.random()*1.3 + 0.3,
        a: Math.random()*0.6 + 0.2,
        speed: Math.random()*0.4 + 0.1,
        phase: Math.random()*Math.PI*2
      });
    }
  }

  function drawStars(t){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){
      var s = stars[i];
      var tw = reduceMotion ? s.a : s.a * (0.6 + 0.4*Math.sin(t*0.001*s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(243,239,228,' + tw.toFixed(3) + ')';
      ctx.fill();
    }
  }

  function loop(t){
    drawStars(t);
    if(!reduceMotion) requestAnimationFrame(loop);
  }

  resize();
  makeStars();
  requestAnimationFrame(loop);

  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      resize();
      makeStars();
      if(reduceMotion) drawStars(0);
    }, 200);
  });

  /* ---------------- GSAP Scroll Animations ---------------- */
  if(window.gsap && window.ScrollTrigger && !reduceMotion){
    gsap.registerPlugin(ScrollTrigger);
    var isMobile = window.innerWidth < 768;

    var badges = gsap.utils.toArray('.formula-badge');
    var positions = [
      {x:-150,y:-150},{x:150,y:-130},{x:-170,y:140},
      {x:170,y:160},{x:0,y:-220},{x:0,y:210}
    ];
    var spread = isMobile ? 0.55 : 1;

    gsap.set(badges, {xPercent:-50, yPercent:-50, scale:0.5});

    var heroTl = gsap.timeline({
      scrollTrigger:{
        trigger:'.hero',
        start:'top top',
        end:'+=130%',
        scrub:true,
        pin:true,
        pinSpacing:true
      }
    });

    heroTl.to('#flipCard', {rotateX:180, ease:'power2.inOut'}, 0);

    badges.forEach(function(b,i){
      var p = positions[i % positions.length];
      heroTl.to(b, {
        x: p.x*spread, y: p.y*spread,
        opacity:1, scale:1,
        ease:'power2.out'
      }, 0);
    });

    heroTl.to('#heroInner', {opacity:0.15, scale:0.92, ease:'power1.in'}, 0.85);

    /* Profile reveal */
    gsap.from('.profile-photo-wrap, .profile .eyebrow, .profile h2, .profile p, .profile-tags', {
      opacity:0, y:50, duration:1, stagger:0.08, ease:'power2.out',
      scrollTrigger:{trigger:'.profile', start:'top 82%'}
    });

    /* Subject sections reveal */
    gsap.utils.toArray('.subject').forEach(function(sec){
      var reverse = sec.classList.contains('reverse');
      var specimen = sec.querySelector('.specimen');
      var text = sec.querySelector('.subject-text');

      gsap.from(specimen, {
        opacity:0, x: reverse ? 70 : -70, rotate: 0,
        duration:1, ease:'power3.out',
        scrollTrigger:{trigger:sec, start:'top 78%'}
      });
      gsap.from(text.children, {
        opacity:0, y:36, duration:0.9, stagger:0.08, ease:'power2.out',
        scrollTrigger:{trigger:sec, start:'top 72%'}
      });
    });

    /* Footer reveal */
    gsap.from('.footer-constellation span, .footer h4, .footer p, .footer .signature', {
      opacity:0, y:30, duration:0.9, stagger:0.08, ease:'power2.out',
      scrollTrigger:{trigger:'.footer', start:'top 85%'}
    });

    ScrollTrigger.addEventListener('refresh', function(){ resize(); makeStars(); });
    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  } else {
    /* Reduced motion / no GSAP fallback: just show everything */
    document.querySelectorAll('.formula-badge').forEach(function(b,i){
      var pos = [[-120,-110],[120,-100],[-130,110],[130,120],[0,-170],[0,170]][i%6];
      b.style.transform = 'translate(-50%,-50%) translate(' + pos[0] + 'px,' + pos[1] + 'px)';
      b.style.opacity = 1;
    });
  }
})();

(function(){
  /* ---------------- Page routing ---------------- */
  var navButtons = document.querySelectorAll('.nav-links button[data-page]');
  var pages = document.querySelectorAll('.page');
  var navLinks = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');

  function showPage(name){
    // page router
    pages.forEach(function(p){ p.classList.toggle('active', p.id === 'page-' + name); });
    navButtons.forEach(function(b){ b.classList.toggle('active', b.dataset.page === name); });
    window.scrollTo({top:0, behavior:'instant' in document.documentElement.style ? 'instant' : 'auto'});
    navLinks.classList.remove('open');
  }

  window.showPage = showPage;
  navButtons.forEach(function(b){
    b.addEventListener('click', function(){ showPage(b.dataset.page); });
  });

  if(navToggle){
    navToggle.addEventListener('click', function(){
      navLinks.classList.toggle('open');
    });
  }


  /* ---------------- Materi TKA carousel ---------------- */
  (function(){
    var track = document.getElementById('tkaTrack');
    var cards = track ? Array.prototype.slice.call(track.querySelectorAll('.tka-card')) : [];
    var play = document.getElementById('tkaPlay');
    var dots = document.getElementById('tkaDots');
    var detail = document.getElementById('materiDetail');
    var close = document.getElementById('materiClose');
    var detailTitle = document.getElementById('materiDetailTitle');
    var detailImage = document.getElementById('materiDetailImage');
    var detailSub = document.getElementById('materiDetailSub');
    var materiList = document.getElementById('materiList');
    if(!track || !cards.length) return;

    var materiData = {
      'Bahasa Indonesia': [
        {title:'Informasi Teks (Tersurat/Tersirat)', summary:'Membedakan informasi yang ditulis langsung di teks dengan informasi yang dapat disimpulkan dari petunjuk dan konteks bacaan.'},
        {title:'Kalimat Penjelas', summary:'Menentukan kalimat yang menjelaskan, memperinci, atau mendukung gagasan utama sebuah paragraf.'},
        {title:'Simpulan', summary:'Merumuskan inti informasi berdasarkan isi keseluruhan teks tanpa menambahkan informasi di luar bacaan.'},
        {title:'Fakta dan Opini', summary:'Membedakan pernyataan yang dapat dibuktikan kebenarannya dengan pendapat atau penilaian penulis.'},
        {title:'Gagasan Utama Paragraf', summary:'Menemukan ide pokok yang menjadi pusat pembahasan dalam sebuah paragraf.'},
        {title:'Menyusun Kalimat', summary:'Menata kalimat agar menjadi paragraf atau teks yang runtut, logis, dan padu.'},
        {title:'Pola Pengembangan Teks', summary:'Mengenali cara teks dikembangkan, misalnya sebab-akibat, perbandingan, contoh, proses, atau kronologis.'},
        {title:'Hubungan Isi Antarparagraf', summary:'Menganalisis keterkaitan gagasan antarparagraf, seperti hubungan penjelas, sebab-akibat, pertentangan, atau lanjutan.'},
        {title:'Makna Kata', summary:'Menentukan arti kata sesuai konteks kalimat atau paragraf, termasuk makna denotatif dan kontekstual.'},
        {title:'Makna Kalimat', summary:'Menafsirkan maksud sebuah kalimat dengan memperhatikan konteks dan hubungan antarkalimat.'},
        {title:'Tabel, Grafik, Bagan, Infografik', summary:'Membaca data visual, membandingkan informasi, menemukan tren, dan menarik kesimpulan dari penyajian data.'},
        {title:'Tujuan Penulis', summary:'Menentukan alasan atau tujuan penulis menyusun teks, misalnya menginformasikan, menjelaskan, meyakinkan, atau menghibur.'},
        {title:'Struktur Cerpen', summary:'Mengenali bagian-bagian pembentuk cerpen seperti orientasi, konflik, klimaks, dan penyelesaian.'},
        {title:'Unsur Intrinsik Cerpen', summary:'Menganalisis tema, tokoh, penokohan, alur, latar, sudut pandang, dan amanat dalam cerpen.'},
        {title:'Unsur Ekstrinsik Cerpen', summary:'Mengkaji faktor di luar cerita yang memengaruhi karya, seperti nilai sosial, budaya, sejarah, dan latar belakang pengarang.'}
      ],
      'Fisika': [
        {title:'Neraca', summary:'Membaca hasil pengukuran massa dari neraca dan menuliskan hasil sesuai skala serta ketelitian alat.'},
        {title:'Angka Penting', summary:'Menentukan jumlah angka penting dan aturan pembulatan pada hasil pengukuran dan perhitungan fisika.'},
        {title:'Penyebab Terjadinya Pemanasan Global', summary:'Mengkaji peningkatan gas rumah kaca, sumber emisi, dan hubungan aktivitas manusia dengan kenaikan suhu rata-rata bumi.'},
        {title:'Gerak Lurus Beraturan (GLB)', summary:'Gerak pada lintasan lurus dengan kecepatan konstan. Hubungan dasarnya adalah s = v·t.'},
        {title:'Gerak Horizontal', summary:'Menganalisis gerak benda yang dilempar mendatar dengan komponen horizontal berkecepatan tetap dan komponen vertikal dipengaruhi gravitasi.'},
        {title:'Gerak Melingkar Dengan Laju Konstan (Tetap) - GMB', summary:'Mempelajari periode, frekuensi, kecepatan sudut, dan percepatan sentripetal pada gerak melingkar beraturan.'},
        {title:'Hubungan Momen Gaya dan Momen Inersia', summary:'Menghubungkan torsi, momen inersia, dan percepatan sudut melalui hubungan τ = Iα.'},
        {title:'Hukum I Newton', summary:'Benda mempertahankan keadaan diam atau bergerak lurus beraturan jika resultan gaya pada benda sama dengan nol.'},
        {title:'Gaya Berat', summary:'Menentukan gaya gravitasi pada massa benda dengan konsep W = m·g dan membedakannya dari massa.'},
        {title:'Momentum', summary:'Besaran gerak yang dirumuskan p = m·v dan arahnya mengikuti arah kecepatan benda.'},
        {title:'Hukum Kekekalan Momentum', summary:'Jumlah momentum total sistem tetap pada sistem terisolasi ketika resultan impuls atau gaya eksternal dapat diabaikan.'},
        {title:'Konsep Tekanan', summary:'Tekanan merupakan gaya per satuan luas, P = F/A, dan menjadi dasar pembahasan fluida.'},
        {title:'Tekanan Hidrostatis dan Tekanan Total', summary:'Tekanan dalam fluida diam bertambah terhadap kedalaman. Tekanan hidrostatis dinyatakan p = ρgh dan tekanan total menambahkan tekanan permukaan.'},
        {title:'Kalor Jenis (Perubahan Suhu)', summary:'Menghubungkan kalor, massa, kalor jenis, dan perubahan suhu melalui Q = m·c·ΔT.'},
        {title:'Hukum Boyle', summary:'Pada suhu tetap, tekanan gas berbanding terbalik dengan volumenya sehingga P₁V₁ = P₂V₂.'},
        {title:'Hukum Boyle Dan Guy-Lussac', summary:'Menganalisis perubahan tekanan, volume, dan suhu gas menggunakan hubungan gabungan hukum gas.'},
        {title:'Proses Adiabatik', summary:'Proses perubahan keadaan gas tanpa pertukaran kalor dengan lingkungan, sehingga perubahan energi berkaitan dengan kerja gas.'},
        {title:'Entropi', summary:'Menggambarkan perubahan ketidakteraturan atau penyebaran energi dan digunakan untuk menganalisis arah proses termodinamika.'},
        {title:'Intensitas dan Taraf Intensitas', summary:'Membandingkan kuat bunyi melalui intensitas dan taraf intensitas dalam skala desibel.'},
        {title:'Mikroskop', summary:'Menganalisis pembentukan bayangan pada mikroskop dan perbesaran total dari lensa objektif dan okuler.'},
        {title:'Episkop', summary:'Mempelajari sistem optik untuk memproyeksikan atau menampilkan benda buram dengan bantuan cahaya dan lensa.'},
        {title:'Kamera', summary:'Menganalisis pembentukan bayangan pada lensa kamera serta hubungan jarak benda, jarak bayangan, dan fokus.'},
        {title:'Hukum II Kirchhoff', summary:'Menggunakan aturan loop pada rangkaian listrik: jumlah perubahan potensial sepanjang satu loop tertutup bernilai nol.'},
        {title:'Transmisi Daya', summary:'Menganalisis pengiriman energi listrik dari pembangkit ke beban dengan memperhatikan tegangan, arus, daya, dan rugi-rugi.'},
        {title:'Resultan Medan Listrik Oleh 2 Muatan atau Lebih Segaris', summary:'Menjumlahkan medan listrik dari beberapa muatan secara vektor berdasarkan besar, arah, dan posisi tiap muatan.'}
      ],
      'Matematika': [
        {title:'Penyelesaian Persamaan Linier Tiga Variabel', summary:'Menentukan nilai tiga variabel pada SPLTV melalui substitusi, eliminasi, atau metode matriks.'},
        {title:'Komposisi Dua Buah Fungsi', summary:'Menentukan fungsi hasil komposisi (f∘g)(x) dengan memasukkan fungsi g ke dalam f.'},
        {title:'Menentukan Nilai Fungsi Invers', summary:'Menentukan pasangan input-output yang dibalik melalui fungsi invers dan memeriksa syarat keterbalikan.'},
        {title:'Perbandingan Trigonometri pada Segitiga Siku-siku', summary:'Menggunakan sinus, cosinus, dan tangen untuk menghubungkan sisi-sisi dan sudut pada segitiga siku-siku.'},
        {title:'Sistem Pertidaksamaan Linier Dua Variabel', summary:'Menentukan daerah himpunan penyelesaian dari beberapa pertidaksamaan pada bidang koordinat.'},
        {title:'Pemodelan Soal Cerita', summary:'Mengubah informasi verbal menjadi variabel, persamaan, pertidaksamaan, lalu menafsirkan hasil sesuai konteks.'},
        {title:'Translasi Suatu Matriks untuk Titik', summary:'Menerapkan perpindahan titik pada bidang dengan vektor translasi dan menuliskan koordinat hasil.'},
        {title:'Suku ke-n Barisan Aritmetika', summary:'Menentukan suku tertentu dengan rumus Uₙ = a + (n−1)b.'},
        {title:'Suku ke-n Barisan Geometri', summary:'Menentukan suku tertentu dengan rumus Uₙ = arⁿ⁻¹.'},
        {title:'Kedudukan Bidang terhadap Bidang', summary:'Menentukan apakah dua bidang berimpit, sejajar, berpotongan, atau memiliki hubungan tertentu dari representasi geometri/aljabar.'},
        {title:'Diagram Garis', summary:'Membaca perubahan data dari waktu ke waktu melalui titik dan garis yang menghubungkan data.'},
        {title:'Rata-Rata', summary:'Menghitung mean sebagai jumlah seluruh data dibagi banyaknya data dan menafsirkan pengaruh perubahan data terhadap mean.'},
        {title:'Aturan Penjumlahan dan Perkalian', summary:'Menghitung banyak cara pada kasus pilihan saling lepas atau proses berurutan menggunakan prinsip pencacahan.'},
        {title:'Peluang Dua Kejadian yang Saling Lepas', summary:'Untuk kejadian saling lepas, peluang gabungan dihitung dengan P(A∪B)=P(A)+P(B).'},
        {title:'Sifat Eksponen', summary:'Menggunakan aturan perpangkatan seperti aᵐ·aⁿ=aᵐ⁺ⁿ, aᵐ/aⁿ=aᵐ⁻ⁿ, dan (aᵐ)ⁿ=aᵐⁿ.'},
        {title:'Irisan', summary:'Menentukan elemen atau bagian yang berada pada dua himpunan atau dua objek sekaligus.'},
        {title:'Perbandingan Senilai Bertingkat', summary:'Menyelesaikan hubungan perbandingan yang melibatkan lebih dari satu besaran dengan menjaga rasio yang setara.'},
        {title:'Sudut', summary:'Menganalisis ukuran sudut, hubungan sudut, dan penerapannya pada garis, bangun datar, dan situasi geometri.'},
        {title:'Keliling Bangun Datar', summary:'Menghitung panjang seluruh sisi yang membatasi suatu bangun datar.'},
        {title:'Keliling Gabungan Bangun Datar', summary:'Menentukan keliling bentuk gabungan dengan hanya menjumlahkan sisi yang berada pada batas luar.'},
        {title:'Menerapkan Teorema Pythagoras untuk Menyelesaikan Masalah', summary:'Menggunakan a²+b²=c² pada segitiga siku-siku untuk menemukan panjang sisi atau menyelesaikan masalah kontekstual.'},
        {title:'Kesebangunan Bangun Datar', summary:'Membandingkan bangun yang bentuknya sama melalui kesetaraan sudut dan perbandingan sisi bersesuaian.'},
        {title:'Luas Permukaan Bangun Ruang', summary:'Menjumlahkan luas seluruh sisi permukaan bangun ruang sesuai jaring-jaring atau rumus bangunnya.'},
        {title:'Volume Bangun Ruang', summary:'Menghitung banyak ruang yang ditempati bangun menggunakan rumus volume sesuai jenis bangun.'}
      ],
      'Matematika Tingkat Lanjut': [
        {title:'Fungsi Trigonometri', summary:'Mempelajari nilai, grafik, periodisitas, transformasi, dan persamaan dasar fungsi sinus, cosinus, serta tangen.'},
        {title:'Kesamaan Dua Matriks', summary:'Dua matriks sama jika memiliki ordo sama dan setiap elemen yang bersesuaian bernilai sama.'},
        {title:'Determinan dan Invers Matriks Ordo 2x2', summary:'Menghitung determinan dan invers matriks 2×2 dengan syarat determinannya tidak nol.'},
        {title:'Sifat Determinan dan Invers Matriks', summary:'Menggunakan sifat determinan serta hubungan (AB)⁻¹ = B⁻¹A⁻¹ pada matriks yang memenuhi syarat.'},
        {title:'Penyelesaian SPLTV Menggunakan Matriks', summary:'Menyusun SPLTV dalam bentuk AX=B dan menyelesaikannya menggunakan operasi matriks atau invers matriks.'},
        {title:'Rotasi Kurva Terhadap Titik Pusat (a,b) Sejauh a', summary:'Menganalisis transformasi rotasi pada titik atau kurva terhadap pusat tertentu dan menentukan koordinat hasil.'},
        {title:'Fungsi Eksponen y = ax dengan a > 1', summary:'Mengkaji fungsi eksponen dengan pertumbuhan, sifat grafik, domain, range, dan perilaku saat x berubah.'},
        {title:'Menentukan Suatu Vektor', summary:'Menentukan komponen vektor dari titik, arah, atau perpindahan pada bidang maupun ruang.'},
        {title:'Panjang Vektor', summary:'Menghitung magnitudo vektor, misalnya |v| = √(x²+y²) untuk vektor bidang.'},
        {title:'Operasi Vektor', summary:'Melakukan penjumlahan, pengurangan, dan perkalian skalar pada vektor.'},
        {title:'Perkalian Titik Dua Buah Vektor', summary:'Menggunakan dot product untuk memperoleh skalar dan menganalisis hubungan sudut antarvektor.'},
        {title:'Persamaan Lingkaran Pusat (0,0)', summary:'Menentukan bentuk x²+y²=r² untuk lingkaran berpusat di titik asal.'},
        {title:'Persamaan Garis Singgung melalui Titik (x,y) pada Lingkaran', summary:'Menentukan persamaan garis yang menyinggung lingkaran pada titik tertentu.'},
        {title:'Persamaan Garis Singgung dengan Gradien', summary:'Menentukan garis singgung lingkaran berdasarkan gradien dan syarat jarak garis terhadap pusat sama dengan jari-jari.'},
        {title:'Kesamaan Suku Banyak (Polinomial)', summary:'Menentukan koefisien atau hubungan polinomial berdasarkan kesamaan nilai untuk semua x.'},
        {title:'Pembagian Suku Banyak dengan Cara Horner', summary:'Membagi polinomial secara efisien menggunakan skema Horner untuk memperoleh hasil bagi dan sisa.'},
        {title:'Teorema Sisa', summary:'Sisa pembagian P(x) oleh (x−a) adalah P(a).'},
        {title:'Teorema Faktor', summary:'(x−a) merupakan faktor P(x) jika dan hanya jika P(a)=0.'},
        {title:'Fungsi Polinomial dan Grafiknya', summary:'Menganalisis bentuk, akar, titik potong, perilaku ujung grafik, dan keterkaitan koefisien pada fungsi polinomial.'}
      ],
      'Bahasa Inggris': [
        {title:'Narrative: Fable', summary:'Mempelajari teks cerita yang menyampaikan alur dan pesan moral melalui tokoh, konflik, dan penyelesaian.'},
        {title:'Biographical Recount', summary:'Memahami teks yang menceritakan kembali peristiwa penting dalam kehidupan seseorang secara kronologis.'},
        {title:'Procedure Text', summary:'Mempelajari teks yang menjelaskan langkah-langkah melakukan sesuatu dengan urutan, tujuan, dan kata kerja yang tepat.'},
        {title:'Analytical Exposition', summary:'Menganalisis teks yang menyatakan pendapat atau tesis lalu memberikan argumen untuk mendukungnya.'},
        {title:'Infographic', summary:'Membaca informasi gabungan teks, angka, ikon, dan grafik dalam bahasa Inggris lalu menemukan detail dan kesimpulannya.'}
      ]
    };

    var index = 0, startX = 0, dragging = false;
    var preview = document.getElementById('materiPreview');
    var previewImg = preview ? preview.querySelector('img') : null;
    var thumbs = document.getElementById('tkaThumbs');
    var viewAll = document.getElementById('tkaViewAll');

    cards.forEach(function(c,i){
      var b=document.createElement('button');
      b.type='button'; b.setAttribute('aria-label','Pilih '+c.dataset.title);
      b.addEventListener('click',function(){ go(i); });
      dots.appendChild(b);

      if(thumbs){
        var img=c.querySelector('img');
        var tb=document.createElement('button');
        tb.type='button';
        tb.className='tka-thumb';
        tb.setAttribute('aria-label','Pilih '+c.dataset.title);
        tb.innerHTML='<img src="'+(img?img.src:'')+'" alt=""><span>'+c.dataset.title+'</span>';
        tb.addEventListener('click',function(){ go(i); });
        thumbs.appendChild(tb);
      }
    });

    function go(next){
      index = (next + cards.length) % cards.length;
      cards.forEach(function(c,i){
        var diff=(i-index+cards.length)%cards.length;
        if(diff===0) c.className='tka-card center';
        else if(diff===1) c.className='tka-card right1';
        else if(diff===cards.length-1) c.className='tka-card left1';
        else if(diff===2) c.className='tka-card right2';
        else if(diff===cards.length-2) c.className='tka-card left2';
        else c.className='tka-card';
      });
      Array.prototype.slice.call(dots.children).forEach(function(b,i){ b.classList.toggle('active',i===index); });
      if(thumbs){
        Array.prototype.slice.call(thumbs.children).forEach(function(b,i){
          b.classList.toggle('active', i===index);
          if(i===index){
            try{ b.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'}); }catch(e){}
          }
        });
      }
      var active=cards[index];
      var img=active ? active.querySelector('img') : null;
      if(previewImg && img){
        previewImg.src=img.src;
        previewImg.alt=img.alt || active.dataset.title || '';
      }
    }
    if(viewAll){
      viewAll.addEventListener('click', function(){ if(play) play.click(); });
    }
    var detailIntro = document.getElementById('materiDetailIntro');
    function escText(v){ return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function lessonFocus(item, subject){
      var t=item.title.toLowerCase();
      if(subject==='Bahasa Indonesia'){
        if(t.includes('tersurat')||t.includes('tersirat')) return 'Pada TKA, kemampuan ini dipakai untuk membedakan bukti yang benar-benar tertulis dengan informasi yang harus ditarik dari hubungan beberapa kalimat. Bacaan tidak selalu menyebut jawabannya secara langsung; sering kali petunjuk tersebar di beberapa bagian sehingga kamu perlu menggabungkan informasi yang relevan sebelum menyimpulkan sesuatu.';
        if(t.includes('kalimat penjelas')) return 'Kalimat penjelas harus mendukung gagasan utama, bukan membuka topik baru yang tidak berhubungan. Perhatikan kata rujukan, contoh, rincian, alasan, data, atau uraian yang membuat ide pokok menjadi lebih jelas.';
        if(t.includes('simpulan')) return 'Simpulan yang baik merangkum inti bacaan tanpa menambah pendapat pribadi. Carilah beberapa gagasan penting yang muncul berulang, hubungan antargagasan, lalu ubah menjadi pernyataan yang lebih umum tetapi tetap sesuai bukti teks.';
        if(t.includes('fakta dan opini')) return 'Fakta mempunyai dasar yang dapat diperiksa, sedangkan opini merupakan penilaian, keyakinan, atau tafsiran. Kata seperti paling, sebaiknya, menurut saya, luar biasa, atau terbaik dapat menjadi petunjuk, tetapi keputusan tetap harus didasarkan pada makna keseluruhan kalimat.';
        if(t.includes('gagasan utama')) return 'Gagasan utama adalah pusat pembahasan paragraf. Ia dapat muncul pada awal, akhir, atau tersirat melalui seluruh rangkaian kalimat. Bedakan gagasan utama dari kalimat penjelas yang hanya memberi contoh, data, alasan, atau rincian.';
        if(t.includes('menyusun kalimat')) return 'Urutan kalimat harus membentuk alur yang logis. Periksa hubungan sebab-akibat, urutan waktu, kata rujukan, kata sambung, serta kesinambungan subjek yang sedang dibicarakan.';
        if(t.includes('pola pengembangan')) return 'Pola pengembangan menunjukkan bagaimana penulis membangun gagasan. Teks dapat bergerak secara kronologis, sebab-akibat, perbandingan, klasifikasi, contoh, atau uraian proses. Mengenali pola membantu kamu memprediksi hubungan kalimat berikutnya.';
        if(t.includes('antarparagraf')) return 'Hubungan antarparagraf dapat berupa penambahan, penjelasan, pertentangan, sebab-akibat, atau kelanjutan gagasan. Jangan membaca tiap paragraf sebagai bagian yang berdiri sendiri; lihat bagaimana paragraf sebelumnya menyiapkan informasi untuk paragraf berikutnya.';
        if(t.includes('makna kata')) return 'Makna kata dalam soal TKA sangat bergantung pada konteks. Satu kata bisa memiliki arti berbeda pada kalimat berbeda, sehingga arti kamus saja belum tentu menjadi jawaban yang benar.';
        if(t.includes('makna kalimat')) return 'Untuk memahami makna kalimat, perhatikan siapa melakukan apa, hubungan antarfrasa, kata hubung, penyangkalan, dan konteks paragraf. Parafrasekan kalimat dengan bahasa sendiri tanpa mengubah maksudnya.';
        if(t.includes('tabel')||t.includes('grafik')||t.includes('bagan')||t.includes('infografik')) return 'Data visual harus dibaca bersama judul, satuan, legenda, label, dan periode waktunya. Setelah itu bandingkan data yang relevan, cari perubahan atau pola, dan tarik kesimpulan hanya dari informasi yang benar-benar tersedia.';
        if(t.includes('tujuan penulis')) return 'Tujuan penulis berkaitan dengan fungsi teks: memberi informasi, menjelaskan, meyakinkan, mengkritik, mengajak, atau menghibur. Perhatikan isi, pilihan kata, dan bentuk penyajian untuk menentukan maksud utama, bukan hanya satu kalimat.';
        if(t.includes('struktur cerpen')) return 'Struktur cerpen membantu kita melihat bagaimana cerita bergerak dari pengenalan menuju konflik, perkembangan masalah, puncak konflik, dan penyelesaian. Tidak semua cerpen memakai urutan yang sangat sederhana, sehingga alur perlu dibaca sebagai rangkaian peristiwa.';
        if(t.includes('intrinsik')) return 'Unsur intrinsik adalah unsur yang membangun cerita dari dalam, seperti tema, tokoh, penokohan, alur, latar, sudut pandang, dan amanat. Analisis yang kuat selalu menghubungkan unsur-unsur tersebut dengan bukti dari cerita.';
        if(t.includes('ekstrinsik')) return 'Unsur ekstrinsik berasal dari luar teks, misalnya latar sosial, budaya, nilai, kondisi sejarah, atau pengalaman pengarang. Unsur ini membantu menjelaskan mengapa sebuah cerita membawa tema, konflik, atau nilai tertentu.';
      }
      if(subject==='Fisika'){
        if(t==='neraca') return 'Neraca digunakan untuk mengukur massa. Materi ini menekankan cara membaca skala, mengenali ketelitian alat, dan memastikan posisi benda serta alat ukur sudah benar agar hasil pengukuran dapat dipercaya.';
        if(t.includes('angka penting')) return 'Angka penting menunjukkan tingkat ketelitian hasil pengukuran. Dalam perhitungan, aturan penjumlahan, pengurangan, perkalian, dan pembagian harus memperhatikan ketelitian data asal sehingga hasil tidak memberi kesan lebih teliti daripada alat ukurnya.';
        if(t.includes('pemanasan global')) return 'Pemanasan global adalah kenaikan suhu rata-rata sistem Bumi yang terutama berkaitan dengan meningkatnya konsentrasi gas rumah kaca. Pahami hubungan radiasi, efek rumah kaca, aktivitas manusia, dan perubahan keseimbangan energi Bumi.';
        if(t.includes('gerak lurus beraturan')) return 'GLB adalah gerak pada lintasan lurus dengan kecepatan tetap. Karena kecepatannya tidak berubah, percepatan nol dan hubungan posisi terhadap waktu dapat ditulis x = x0 + vt. Soal TKA sering menguji kemampuan membaca grafik dan memilih model gerak yang tepat.';
        if(t.includes('gerak horizontal')) return 'Gerak horizontal biasanya dianalisis sebagai komponen gerak dengan kecepatan awal mendatar. Pisahkan gerak pada sumbu horizontal dan vertikal agar perpindahan, waktu, serta kecepatan dapat dihitung dari persamaan yang sesuai.';
        if(t.includes('melingkar')) return 'Gerak melingkar beraturan memiliki kelajuan tetap tetapi arah kecepatan terus berubah. Karena arah berubah, benda mengalami percepatan sentripetal menuju pusat lintasan, dengan hubungan ac = v²/r dan v = ωr.';
        if(t.includes('momen gaya')) return 'Momen gaya menggambarkan kecenderungan gaya untuk memutar benda terhadap poros. Besarnya bergantung pada gaya dan lengan momennya, sedangkan momen inersia menggambarkan seberapa sulit benda mengubah gerak rotasinya. Hubungan dinamikanya dapat ditulis τ = Iα.';
        if(t.includes('hukum i newton')) return 'Hukum I Newton menjelaskan sifat inersia: benda mempertahankan keadaan diam atau bergerak lurus beraturan ketika resultan gaya nol. Kunci soal adalah menentukan semua gaya yang bekerja lalu melihat apakah jumlah vektornya sama dengan nol.';
        if(t.includes('gaya berat')) return 'Gaya berat adalah gaya gravitasi yang bekerja pada massa benda. Dekat permukaan Bumi, besarnya dapat dihitung dengan w = mg. Bedakan gaya berat dari massa, karena massa tetap sedangkan berat bergantung pada percepatan gravitasi.';
        if(t.includes('momentum') && !t.includes('kekekalan')) return 'Momentum adalah ukuran kecenderungan benda yang sedang bergerak untuk mempertahankan geraknya, dinyatakan p = mv. Karena momentum merupakan besaran vektor, arah gerak harus diperhatikan saat menjumlahkan atau mengurangkannya.';
        if(t.includes('kekekalan momentum')) return 'Pada sistem yang resultan gaya eksternalnya dapat diabaikan, jumlah momentum sebelum interaksi sama dengan jumlah momentum sesudahnya. Konsep ini sangat penting pada tumbukan dan ledakan karena memungkinkan kita menghubungkan beberapa keadaan gerak tanpa mengetahui semua detail gaya selama interaksi.';
        if(t.includes('konsep tekanan')) return 'Tekanan menyatakan seberapa besar gaya bekerja pada setiap satuan luas, P = F/A. Dengan gaya yang sama, luas bidang tekan yang lebih kecil menghasilkan tekanan lebih besar; ide sederhana ini mendasari banyak penerapan dalam kehidupan sehari-hari.';
        if(t.includes('hidrostatis')) return 'Tekanan hidrostatis muncul karena berat fluida di atas suatu titik. Pada kedalaman h dalam fluida dengan massa jenis ρ, kontribusinya sebesar ρgh. Untuk tekanan total, tekanan atmosfer juga perlu diperhitungkan sesuai konteks soal.';
        if(t.includes('kalor jenis')) return 'Kalor jenis menunjukkan banyaknya energi yang dibutuhkan untuk menaikkan suhu satu satuan massa zat sebesar satu derajat. Hubungannya Q = mcΔT. Semakin besar kalor jenis, semakin banyak energi yang diperlukan untuk perubahan suhu yang sama.';
        if(t.includes('hukum boyle') && t.includes('guy')) return 'Untuk jumlah gas tetap pada kondisi yang sesuai, hubungan tekanan, volume, dan suhu dapat dinyatakan dalam bentuk P1V1/T1 = P2V2/T2. Pastikan suhu mutlak digunakan ketika suhu masuk ke persamaan gas.';
        if(t.includes('hukum boyle')) return 'Hukum Boyle menyatakan bahwa pada suhu tetap dan jumlah gas tetap, tekanan berbanding terbalik dengan volume. Secara matematis P1V1 = P2V2. Artinya ketika volume diperkecil, tekanan meningkat selama kondisi lain tetap.';
        if(t.includes('adiabatik')) return 'Proses adiabatik adalah proses termodinamika tanpa perpindahan kalor ke atau dari sistem, sehingga Q = 0. Perubahan energi dalam terjadi melalui usaha dan untuk gas ideal hubungan tekanan-volume dapat dikaji dengan PV^γ = konstan.';
        if(t.includes('entropi')) return 'Entropi dipakai untuk menggambarkan arah dan tingkat penyebaran energi dalam sistem. Dalam proses reversibel, perubahan entropi dapat dinyatakan ΔS = Qrev/T. Pada proses nyata, hukum kedua termodinamika menuntut perubahan entropi total tidak berkurang.';
        if(t.includes('intensitas') && t.includes('taraf')) return 'Intensitas bunyi berkaitan dengan daya yang diterima setiap satuan luas. Taraf intensitas menggunakan skala logaritmik, β = 10 log(I/I0), sehingga perubahan intensitas yang besar tidak terbaca sebagai perubahan linear pada skala desibel.';
        if(t==='mikroskop') return 'Mikroskop menghasilkan perbesaran melalui kombinasi lensa objektif dan okuler. Untuk memahami soal, tentukan pembentukan bayangan oleh lensa objektif terlebih dahulu, lalu analisis bagaimana lensa okuler memperbesar bayangan tersebut.';
        if(t==='episkop') return 'Episkop merupakan alat optik untuk memproyeksikan gambar atau benda yang tidak tembus cahaya. Prinsip dasarnya berkaitan dengan pemantulan cahaya dan pembentukan bayangan sehingga objek dapat diamati pada layar.';
        if(t==='kamera') return 'Kamera memanfaatkan lensa cembung untuk membentuk bayangan nyata, terbalik, dan diperkecil pada sensor atau film. Fokus materi meliputi jarak benda, jarak bayangan, fokus lensa, serta bagaimana perubahan posisi memengaruhi fokus.';
        if(t.includes('kirchhoff')) return 'Hukum II Kirchhoff menyatakan bahwa jumlah aljabar perubahan potensial dalam satu lintasan tertutup sama dengan nol. Gunakan satu arah loop secara konsisten, beri tanda sesuai kenaikan atau penurunan potensial, lalu susun persamaan untuk menemukan arus yang dicari.';
        if(t.includes('transmisi daya')) return 'Transmisi daya listrik bertujuan menyalurkan energi dengan kehilangan sekecil mungkin. Karena rugi daya pada kabel berkaitan dengan I²R, menaikkan tegangan transmisi dapat menurunkan arus untuk daya yang sama sehingga rugi energi pada penghantar menjadi lebih kecil.';
        if(t.includes('medan listrik')) return 'Medan listrik oleh beberapa muatan harus dijumlahkan secara vektor. Tentukan arah medan dari setiap muatan di titik pengamatan, hitung besar masing-masing bila diperlukan, kemudian kombinasikan komponen atau arah yang sesuai agar resultannya benar.';
      }
      if(subject==='Matematika' || subject==='Matematika Tingkat Lanjut'){
        if(t.includes('persamaan linier tiga variabel')||t.includes('spltv')) return 'SPLTV terdiri dari tiga persamaan linear yang memuat tiga variabel. Tujuan utamanya adalah menemukan nilai variabel yang memenuhi ketiga persamaan sekaligus. Penyelesaian dapat dilakukan dengan eliminasi, substitusi, atau representasi matriks, dan hasil akhirnya perlu dicek kembali pada persamaan asal.';
        if(t.includes('komposisi')) return 'Komposisi fungsi berarti memasukkan keluaran sebuah fungsi ke fungsi lainnya, ditulis (f∘g)(x)=f(g(x)). Urutan penting karena pada umumnya f(g(x)) tidak sama dengan g(f(x)). Mulailah dengan fungsi yang berada paling dalam lalu lanjutkan ke fungsi luar.';
        if(t.includes('fungsi invers')) return 'Fungsi invers membalik proses sebuah fungsi. Untuk menentukan invers, nyatakan y=f(x), tukar x dan y, lalu selesaikan kembali untuk y dengan memperhatikan domain agar hubungan yang diperoleh benar-benar merupakan fungsi.';
        if(t.includes('trigonometri') && t.includes('segitiga siku')) return 'Pada segitiga siku-siku, sinus, cosinus, dan tangen menghubungkan sudut dengan perbandingan sisi. Pilih perbandingan berdasarkan sisi depan, samping, dan miring, lalu gunakan identitas atau hubungan sudut yang diperlukan untuk menemukan besaran yang belum diketahui.';
        if(t.includes('pertidaksamaan linier')) return 'Sistem pertidaksamaan linear dua variabel membentuk wilayah solusi pada bidang koordinat. Setiap pertidaksamaan menghasilkan satu setengah bidang, sedangkan irisan semua wilayah itulah himpunan penyelesaiannya. Perhatikan apakah garis batas termasuk atau tidak.';
        if(t.includes('pemodelan soal cerita')) return 'Pemodelan menerjemahkan situasi nyata menjadi variabel, persamaan, pertidaksamaan, atau bentuk matematika lain. Bagian terpenting bukan sekadar menghitung, tetapi menentukan apa yang harus dimisalkan, hubungan antarbesaran, dan arti hasil terhadap konteks soal.';
        if(t.includes('barisan aritmetika')) return 'Barisan aritmetika memiliki selisih tetap antar suku. Suku ke-n dapat ditentukan dengan Un=a+(n−1)b. Pahami dulu suku pertama dan beda agar model yang dipakai sesuai dengan pola yang diberikan.';
        if(t.includes('barisan geometri')) return 'Barisan geometri memiliki rasio tetap antar suku. Suku ke-n dinyatakan Un=ar^(n−1). Periksa tanda dan nilai rasio karena keduanya memengaruhi arah perubahan dan pola barisan.';
        if(t.includes('diagram garis')) return 'Diagram garis dipakai untuk melihat perubahan data terhadap urutan atau waktu. Bacalah sumbu dan satuan dengan cermat, kemudian fokus pada kenaikan, penurunan, titik tertinggi, titik terendah, serta selisih antarperiode.';
        if(t.includes('rata-rata')) return 'Rata-rata aritmetika diperoleh dari jumlah seluruh data dibagi banyaknya data. Pada soal TKA, rata-rata sering digabungkan dengan data yang hilang atau perubahan salah satu nilai, sehingga hubungan jumlah total menjadi kunci penyelesaian.';
        if(t.includes('aturan penjumlahan')) return 'Aturan penjumlahan dipakai ketika pilihan berasal dari beberapa kategori yang saling terpisah, sedangkan aturan perkalian dipakai ketika proses terdiri dari beberapa tahap yang harus dilakukan bersama. Memilih aturan yang tepat bergantung pada struktur pilihan, bukan pada bentuk angka semata.';
        if(t.includes('peluang dua kejadian')) return 'Untuk dua kejadian yang saling lepas, keduanya tidak dapat terjadi bersamaan sehingga P(A∪B)=P(A)+P(B). Yang perlu diperhatikan adalah memastikan bahwa irisan A dan B memang kosong sebelum menggunakan rumus tersebut.';
        if(t.includes('eksponen')) return 'Sifat eksponen membantu menyederhanakan perkalian, pembagian, dan perpangkatan yang memiliki basis terkait. Kuasai aturan seperti a^m·a^n=a^(m+n), a^m/a^n=a^(m−n), dan (a^m)^n=a^(mn), lalu terapkan pada bentuk aljabar atau persamaan.';
        if(t==='irisan') return 'Irisan adalah bagian yang dimiliki bersama oleh dua himpunan atau dua wilayah. Dalam geometri dan grafik, istilah ini juga muncul saat menentukan titik perpotongan atau daerah yang memenuhi beberapa syarat sekaligus.';
        if(t.includes('perbandingan senilai')) return 'Perbandingan senilai berarti dua besaran berubah dengan rasio tetap. Pada perbandingan bertingkat, hubungan tersebut diterapkan secara berurutan sehingga perubahan satu besaran memengaruhi besaran lain melalui lebih dari satu rasio.';
        if(t.includes('sudut')) return 'Pengukuran sudut menjadi dasar banyak persoalan geometri. Gunakan hubungan sudut berpelurus, bertolak belakang, sehadap, dalam berseberangan, serta jumlah sudut pada bangun sesuai kondisi yang diberikan.';
        if(t.includes('keliling')) return 'Keliling adalah panjang seluruh batas luar bangun. Untuk bangun gabungan, tentukan terlebih dahulu sisi mana yang benar-benar berada pada perimeter dan jangan menjumlahkan sisi yang berada di bagian dalam.';
        if(t.includes('pythagoras')) return 'Teorema Pythagoras menghubungkan tiga sisi segitiga siku-siku melalui a²+b²=c². Dalam soal kontekstual, tantangan utamanya sering bukan menghitung, melainkan mengenali bentuk segitiga siku-siku dan menentukan sisi miring dengan benar.';
        if(t.includes('kesebangunan')) return 'Bangun sebangun memiliki bentuk yang sama dengan ukuran yang dapat berbeda. Sudut bersesuaian sama besar dan sisi bersesuaian memiliki perbandingan tetap. Konsep ini memungkinkan panjang atau luas yang belum diketahui ditentukan dari informasi yang sudah ada.';
        if(t.includes('luas permukaan')) return 'Luas permukaan diperoleh dari total luas semua sisi yang membentuk bagian luar bangun ruang. Jaring-jaring membantu memvisualisasikan sisi mana yang harus dihitung dan dijumlahkan.';
        if(t.includes('volume')) return 'Volume menyatakan banyaknya ruang yang ditempati benda. Setiap bangun memiliki hubungan antara ukuran alas, tinggi, atau jari-jari yang perlu dipahami agar rumus tidak sekadar dihafal.';
        if(t.includes('fungsi trigonometri')) return 'Fungsi trigonometri mempelajari hubungan nilai sinus, cosinus, dan tangen terhadap sudut. Selain nilai khusus, perhatikan periode, amplitudo, pergeseran grafik, domain, serta cara parameter mengubah bentuk kurva.';
        if(t.includes('kesamaan dua matriks')) return 'Dua matriks disebut sama jika ordonya sama dan setiap elemen pada posisi yang bersesuaian mempunyai nilai sama. Dari kesetaraan elemen inilah nilai variabel dapat ditentukan satu per satu.';
        if(t.includes('determinan') && t.includes('ordo 2x2')) return 'Untuk matriks 2×2, determinan diperoleh dari hasil kali diagonal utama dikurangi hasil kali diagonal lainnya. Invers hanya ada ketika determinannya tidak nol, sehingga syarat tersebut harus selalu diperiksa.';
        if(t.includes('sifat determinan')) return 'Sifat determinan memudahkan perhitungan tanpa selalu mengembangkan matriks dari awal. Pahami dampak pertukaran baris, perkalian suatu baris dengan konstanta, serta hubungan determinan hasil kali matriks.';
        if(t.includes('rotasi kurva')) return 'Rotasi mengubah posisi setiap titik terhadap pusat tertentu dengan sudut yang sama. Untuk kurva, perubahan ini dapat ditangani dengan transformasi koordinat sehingga bentuk hubungan titik setelah rotasi tetap dapat dianalisis secara sistematis.';
        if(t.includes('fungsi eksponen')) return 'Fungsi eksponen berbentuk y=a^x dengan a>1 menunjukkan pertumbuhan ketika x bertambah. Grafiknya meningkat, mempunyai nilai positif, dan mendekati sumbu-x tanpa menyentuhnya. Pahami hubungan perubahan x terhadap perubahan y sebelum membaca grafik.';
        if(t.includes('menentukan suatu vektor')) return 'Vektor ditentukan oleh besar dan arah. Dari dua titik, komponen vektor dapat diperoleh dengan mengurangkan koordinat titik awal dari titik akhir. Representasi komponen ini memudahkan operasi dan perhitungan panjang.';
        if(t.includes('panjang vektor')) return 'Panjang atau magnitudo vektor diperoleh dari akar jumlah kuadrat komponennya. Pada dua dimensi, |v|=√(x²+y²), sedangkan pada tiga dimensi ditambah komponen z.';
        if(t.includes('operasi vektor')) return 'Penjumlahan dan pengurangan vektor dilakukan pada komponen yang bersesuaian, sedangkan perkalian skalar mengubah besar dan, bila negatif, membalik arah vektor. Gunakan bentuk komponen agar perhitungan lebih terstruktur.';
        if(t.includes('perkalian titik')) return 'Dot product dua vektor menghasilkan skalar dan dapat ditulis a·b=|a||b|cosθ. Dari hubungan ini kita dapat mencari sudut, memeriksa ketegaklurusan, atau menghitung proyeksi sesuai kebutuhan soal.';
        if(t.includes('lingkaran pusat')) return 'Lingkaran berpusat di titik asal memiliki persamaan x²+y²=r². Dari persamaan tersebut, jari-jari dapat dikenali dan posisi suatu titik terhadap lingkaran dapat diuji dengan membandingkan x²+y² terhadap r².';
        if(t.includes('garis singgung melalui titik')) return 'Garis singgung menyentuh lingkaran tepat pada satu titik dan tegak lurus jari-jari yang ditarik ke titik singgung tersebut. Hubungan ini dapat digunakan untuk menyusun persamaan garis dari koordinat titik yang diketahui.';
        if(t.includes('garis singgung dengan gradien')) return 'Jika gradien garis singgung diketahui, hubungan kemiringan tersebut dapat dipakai bersama jarak titik pusat ke garis. Syarat garis menyinggung lingkaran adalah jarak tersebut sama dengan jari-jari.';
        if(t.includes('kesamaan suku banyak')) return 'Dua polinomial identik mempunyai koefisien yang sama pada pangkat yang sama. Karena kesamaan berlaku untuk setiap nilai x, kita dapat menyetarakan koefisien untuk menemukan parameter yang belum diketahui.';
        if(t.includes('horner')) return 'Skema Horner menyederhanakan pembagian polinomial dengan mengolah koefisien secara bertahap. Selain menemukan hasil bagi dan sisa, teknik ini membantu menghitung nilai polinomial dengan lebih efisien.';
        if(t.includes('teorema sisa')) return 'Jika polinomial P(x) dibagi oleh x−a, maka sisanya adalah P(a). Teorema ini mengubah persoalan pembagian menjadi evaluasi fungsi yang jauh lebih sederhana.';
        if(t.includes('teorema faktor')) return 'Teorema faktor menyatakan bahwa x−a merupakan faktor P(x) tepat ketika P(a)=0. Jadi untuk mencari faktor, akar polinomial menjadi titik awal yang sangat penting.';
        if(t.includes('fungsi polinomial')) return 'Grafik fungsi polinomial dipengaruhi derajat, koefisien utama, akar, serta titik potong. Dengan mempelajari akar dan tanda fungsi, kita dapat memahami bentuk umum grafik tanpa harus menggambar setiap titik secara acak.';
      }
      if(subject==='Bahasa Inggris'){
        if(t.includes('fable')) return 'Fable adalah cerita naratif yang biasanya memakai hewan atau tokoh sederhana untuk menyampaikan nilai moral. Saat membaca, perhatikan orientation, complication, resolution, tindakan tokoh, serta pesan yang dapat ditarik dari akhir cerita.';
        if(t.includes('biographical')) return 'Biographical recount menceritakan kembali rangkaian peristiwa penting dalam kehidupan seseorang. Fokusnya pada urutan waktu, tindakan, pencapaian, serta kata kerja bentuk lampau yang menandai kejadian yang telah berlangsung.';
        if(t.includes('procedure')) return 'Procedure text menjelaskan cara melakukan atau membuat sesuatu melalui langkah yang teratur. Perhatikan goal, materials bila ada, sequence of steps, kata kerja perintah, penanda urutan, dan hasil yang diharapkan.';
        if(t.includes('analytical exposition')) return 'Analytical exposition menyajikan thesis atau pendapat utama kemudian diikuti argumen yang mendukungnya. Bacalah hubungan antara klaim dan alasan, lalu bedakan alasan yang benar-benar mendukung tesis dari detail yang hanya bersifat tambahan.';
        if(t.includes('infographic')) return 'Infographic menggabungkan teks singkat dengan data visual. Untuk memahami isinya, baca judul, label, angka, ikon, dan hubungan antarbagian sekaligus. Pertanyaan TKA dapat menuntut detail tersurat maupun kesimpulan dari perbandingan data.';
      }
      return 'Materi '+item.title+' membahas konsep utama yang perlu dipahami agar kamu mampu mengenali informasi penting, menghubungkan prinsip yang relevan, dan menerapkannya pada bentuk soal yang berbeda. Jangan berhenti pada definisi; pahami mengapa konsep tersebut bekerja, kapan digunakan, dan bagaimana perubahan informasi pada soal memengaruhi langkah penyelesaiannya.';
    }
    function expandLesson(item, subject){
      var focus=lessonFocus(item, subject);
      return '<p>'+escText(item.summary)+'</p><p>'+escText(focus)+'</p>';
    }
    function doneKey(subject, title){
      return 'su_done::'+subject+'::'+title;
    }
    function isDone(subject, title){
      try{ return localStorage.getItem(doneKey(subject, title)) === '1'; }catch(e){ return false; }
    }
    function setDone(subject, title, val){
      try{
        var k=doneKey(subject, title);
        if(val) localStorage.setItem(k,'1');
        else localStorage.removeItem(k);
      }catch(e){}
    }
    function bmKey(subject, title){ return 'su_bm::'+subject+'::'+title; }
    function isBookmarked(subject, title){
      try{ return localStorage.getItem(bmKey(subject, title)) === '1'; }catch(e){ return false; }
    }
    function setBookmark(subject, title, val){
      try{
        var k = bmKey(subject, title);
        if(val) localStorage.setItem(k, '1');
        else localStorage.removeItem(k);
      }catch(e){}
    }
    function bindBookmarks(root){
      if(!root) return;
      root.querySelectorAll('.materi-bm-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          var sub = btn.getAttribute('data-subject');
          var tit = btn.getAttribute('data-title');
          var now = !isBookmarked(sub, tit);
          setBookmark(sub, tit, now);
          btn.classList.toggle('on', now);
          btn.textContent = now ? '★ Tersimpan' : '☆ Bookmark';
          if (typeof window.__suRenderBookmarks === 'function') window.__suRenderBookmarks();
        });
      });
    }

    function subjectProgress(subject){
      var items=materiData[subject]||[];
      if(!items.length) return {done:0, total:0, pct:0};
      var done=0;
      for(var i=0;i<items.length;i++){ if(isDone(subject, items[i].title)) done++; }
      return {done:done, total:items.length, pct: Math.round(done/items.length*100)};
    }
    function updateCardProgress(){
      cards.forEach(function(c){
        var t=c.dataset.title;
        var p=subjectProgress(t);
        var meta=c.querySelector('.meta');
        if(!meta) return;
        var prog=meta.querySelector('.prog');
        if(!prog){
          prog=document.createElement('span');
          prog.className='prog';
          meta.appendChild(prog);
        }
        prog.textContent = p.done+'/'+p.total+' selesai · '+p.pct+'%';
      });
    }

    function noteKey(subject, title){
      return 'su_note::'+subject+'::'+title;
    }
    function loadNote(subject, title){
      try{ return localStorage.getItem(noteKey(subject, title)) || ''; }catch(e){ return ''; }
    }
    function saveNote(subject, title, value){
      try{
        var k=noteKey(subject, title);
        if(!value) localStorage.removeItem(k);
        else localStorage.setItem(k, value);
      }catch(e){}
    }
    function noteBlock(subject, title){
      var saved=loadNote(subject, title);
      var has=saved.trim().length>0;
      return '<div class="materi-note'+(has?' open':'')+'" data-subject="'+escText(subject)+'" data-title="'+escText(title)+'">'
        +'<button type="button" class="materi-note-toggle" aria-expanded="'+(has?'true':'false')+'">'
        +'<span>📝 Catatan saya</span>'
        +'<span class="hint">'+(has?'tersimpan':'ketuk untuk menulis')+'</span>'
        +'</button>'
        +'<div class="materi-note-body">'
        +'<textarea placeholder="Tulis rumus, tips, atau poin penting di sini...">'+escText(saved)+'</textarea>'
        +'<div class="materi-note-actions">'
        +'<span class="materi-note-status">'+(has?'Tersimpan di perangkat ini':'Belum ada catatan')+'</span>'
        +'<button type="button" class="materi-note-clear">Hapus</button>'
        +'</div></div></div>';
    }
    function bindNotes(root){
      if(!root) return;
      root.querySelectorAll('.materi-note').forEach(function(box){
        var subject=box.getAttribute('data-subject');
        var title=box.getAttribute('data-title');
        var toggle=box.querySelector('.materi-note-toggle');
        var ta=box.querySelector('textarea');
        var status=box.querySelector('.materi-note-status');
        var clear=box.querySelector('.materi-note-clear');
        var hint=toggle.querySelector('.hint');
        var timer=null;
        function mark(saved){
          if(saved){
            status.textContent='Tersimpan di perangkat ini';
            hint.textContent='tersimpan';
          }else{
            status.textContent='Belum ada catatan';
            hint.textContent='ketuk untuk menulis';
          }
        }
        toggle.addEventListener('click', function(){
          var open=box.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open?'true':'false');
          if(open) setTimeout(function(){ ta.focus(); }, 10);
        });
        ta.addEventListener('input', function(){
          status.textContent='Menyimpan...';
          clearTimeout(timer);
          timer=setTimeout(function(){
            var val=ta.value;
            saveNote(subject, title, val);
            mark(val.trim().length>0);
          }, 280);
        });
        clear.addEventListener('click', function(){
          ta.value='';
          saveNote(subject, title, '');
          mark(false);
          status.textContent='Catatan dihapus';
        });
      });
    }
    function openDetail(){
      var card=cards[index], title=card.dataset.title, img=card.querySelector('img');
      try { localStorage.setItem('su_last_subject', title); } catch(e){}
      if (typeof window.__suUpdateContinue === 'function') window.__suUpdateContinue();
      var items=materiData[title] || [];
      var prog=subjectProgress(title);
      detailTitle.textContent=title;
      detailSub.textContent=items.length+' topik materi TKA — gulir ke bawah untuk membaca semuanya';
      detailIntro.innerHTML='Materi TKA '+escText(title)+' disusun sebagai ruang belajar yang bisa dibaca bertahap. Setiap topik punya catatan pribadi dan tombol tandai selesai yang tersimpan di perangkatmu.'
        +'<div class="materi-progress-wrap"><div class="materi-progress-label"><span>Progres</span><strong id="materiProgText">'+prog.done+' / '+prog.total+' · '+prog.pct+'%</strong></div>'
        +'<div class="materi-progress-bar"><span id="materiProgBar" style="width:'+prog.pct+'%"></span></div></div>';
      detailImage.src=img.src; detailImage.alt=img.alt;
      materiList.innerHTML=
        '<div class="materi-search-wrap"><input type="search" class="materi-search-input" id="materiSearch" placeholder="Cari topik..." autocomplete="off"></div>'
        +'<div class="materi-search-empty" id="materiSearchEmpty">Tidak ada topik yang cocok.</div>'
        +items.map(function(item,i){
          var done=isDone(title, item.title);
          return '<article class="materi-item'+(done?' done':'')+'" data-topic="'+escText(item.title)+'">'
            +'<span class="m-index">'+String(i+1).padStart(2,'0')+'</span><h4>'+escText(item.title)+'</h4>'
            +expandLesson(item,title)
            +'<button type="button" class="materi-done-btn" data-subject="'+escText(title)+'" data-title="'+escText(item.title)+'">'
            +(done?'✓ Selesai':'Tandai selesai')+'</button>'
            +'<button type="button" class="materi-bm-btn'+(isBookmarked(title,item.title)?' on':'')+'" data-subject="'+escText(title)+'" data-title="'+escText(item.title)+'">'
            +(isBookmarked(title,item.title)?'★ Tersimpan':'☆ Bookmark')+'</button>'
            +noteBlock(title,item.title)+'</article>';
        }).join('');
      bindNotes(materiList);
      bindDone(materiList, title);
      bindBookmarks(materiList);
      bindSearch(materiList);
      var reader=document.querySelector('.materi-reader-scroll');
      if(reader) reader.scrollTop=0;
      detail.classList.add('open'); detail.setAttribute('aria-hidden','false');
      document.body.classList.add('materi-reading');
      updateCardProgress();
    }
    function refreshProgressUI(subject){
      var prog=subjectProgress(subject);
      var t=document.getElementById('materiProgText');
      var b=document.getElementById('materiProgBar');
      if(t) t.textContent=prog.done+' / '+prog.total+' · '+prog.pct+'%';
      if(b) b.style.width=prog.pct+'%';
      updateCardProgress();
    }
    function bindDone(root, subject){
      if(!root) return;
      root.querySelectorAll('.materi-done-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          var sub=btn.getAttribute('data-subject');
          var tit=btn.getAttribute('data-title');
          var article=btn.closest('.materi-item');
          var now=!isDone(sub, tit);
          setDone(sub, tit, now);
          if(article) article.classList.toggle('done', now);
          btn.textContent=now?'✓ Selesai':'Tandai selesai';
          refreshProgressUI(sub);
        });
      });
    }
    function bindSearch(root){
      var input=document.getElementById('materiSearch');
      var empty=document.getElementById('materiSearchEmpty');
      if(!input || !root) return;
      input.addEventListener('input', function(){
        var q=input.value.trim().toLowerCase();
        var visible=0;
        root.querySelectorAll('.materi-item').forEach(function(el){
          var topic=(el.getAttribute('data-topic')||'').toLowerCase();
          var show=!q || topic.indexOf(q)!==-1;
          el.classList.toggle('hidden-by-search', !show);
          if(show) visible++;
        });
        if(empty) empty.classList.toggle('show', visible===0);
      });
    }
    play.addEventListener('click', openDetail);
    close.addEventListener('click', function(){ detail.classList.remove('open'); detail.setAttribute('aria-hidden','true'); document.body.classList.remove('materi-reading'); });
    detail.addEventListener('click', function(e){ if(e.target===detail){ detail.classList.remove('open'); detail.setAttribute('aria-hidden','true'); document.body.classList.remove('materi-reading'); } });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ detail.classList.remove('open'); detail.setAttribute('aria-hidden','true'); document.body.classList.remove('materi-reading'); } });

    function pointerDown(e){ dragging=true; startX=e.clientX || (e.touches&&e.touches[0].clientX); }
    function pointerUp(e){
      if(!dragging) return; dragging=false;
      var x=e.clientX || (e.changedTouches&&e.changedTouches[0].clientX);
      var dx=x-startX;
      if(Math.abs(dx)>40) go(index + (dx<0 ? 1 : -1));
    }
    track.addEventListener('pointerdown', pointerDown, {passive:true});
    track.addEventListener('pointerup', pointerUp, {passive:true});
    track.addEventListener('pointercancel', function(){ dragging=false; }, {passive:true});
    go(0);

    window.__suOpenMateri = function(title){
      var i = -1;
      for (var n = 0; n < cards.length; n++) {
        if (cards[n].dataset.title === title) { i = n; break; }
      }
      if (i < 0) return false;
      go(i);
      openDetail();
      return true;
    };
    updateCardProgress();
  })();


  
  /* ---------------- Quiz + XP + Daily ---------------- */
  (function(){
    var quizBank = [
      {q:'Hasil dari 2^3 x 2^2 adalah?', opts:['2^5','2^6','2^1','16'], ans:0, exp:'a^m * a^n = a^(m+n) sehingga hasilnya 2^5.', cat:'Matematika'},
      {q:'Hukum I Newton menyatakan bahwa...', opts:['F = ma','Benda mempertahankan diam/GLB jika resultan gaya nol','Setiap aksi ada reaksi','Energi selalu kekal'], ans:1, exp:'Hukum inersia: resultan gaya nol berarti diam atau GLB.', cat:'Fisika'},
      {q:'Rumus tekanan adalah...', opts:['P = F/A','P = m*g','P = rho*V','P = W/t'], ans:0, exp:'Tekanan = gaya per satuan luas (P = F/A).', cat:'Fisika'},
      {q:'Pada segitiga siku-siku, sisi miring disebut...', opts:['Alas','Tinggi','Hipotenusa','Kaki'], ans:2, exp:'Sisi di depan sudut siku-siku adalah hipotenusa.', cat:'Matematika'},
      {q:'Kalor jenis menyatakan...', opts:['Energi untuk menaikkan suhu 1 satuan massa 1 derajat','Suhu mutlak gas','Daya listrik','Intensitas bunyi'], ans:0, exp:'Q = mc Delta T; c adalah kalor jenis.', cat:'Fisika'},
      {q:'Dua kejadian saling lepas berarti...', opts:['Selalu terjadi bersamaan','Tidak dapat terjadi bersamaan','P gabungan = hasil kali','Saling bebas saja'], ans:1, exp:'Irisan kosong, sehingga peluang gabungan = jumlah peluang.', cat:'Matematika'},
      {q:'Momentum linear didefinisikan sebagai...', opts:['p = m v','p = 1/2 m v^2','p = F t saja','p = m/v'], ans:0, exp:'p = m*v dan merupakan besaran vektor.', cat:'Fisika'},
      {q:'Fungsi invers membalik...', opts:['Domain saja','Proses fungsi (input dan output)','Hanya grafik','Koefisien polinomial'], ans:1, exp:'Jika y = f(x), invers mengembalikan x dari y.', cat:'Matematika'},
      {q:'Barisan aritmetika memiliki...', opts:['Rasio tetap','Selisih tetap antar suku','Suku tak hingga saja','Hanya bilangan genap'], ans:1, exp:'Beda tetap; Un = a+(n-1)b.', cat:'Matematika'},
      {q:'Tekanan hidrostatis pada kedalaman h sebanding dengan...', opts:['rho g h','m g h','1/2 rho v^2','F * s'], ans:0, exp:'P hidro = rho * g * h.', cat:'Fisika'},
      {q:'Determinan matriks 2x2 [[a,b],[c,d]] adalah...', opts:['ad - bc','ab - cd','a + d','ac - bd'], ans:0, exp:'det = ad - bc; invers ada jika det tidak nol.', cat:'Matematika'},
      {q:'Pada proses adiabatik...', opts:['Q = 0','Delta U = 0','W = 0','T selalu tetap'], ans:0, exp:'Tidak ada perpindahan kalor; Q = 0.', cat:'Fisika'}
    ];
    var overlay = document.getElementById('quizOverlay');
    var titleEl = document.getElementById('quizTitle');
    var metaEl = document.getElementById('quizMeta');
    var qEl = document.getElementById('quizQ');
    var optsEl = document.getElementById('quizOpts');
    var fbEl = document.getElementById('quizFeedback');
    var nextBtn = document.getElementById('quizNext');
    var closeBtn = document.getElementById('quizClose');
    var startBtn = document.getElementById('quizStartBtn');
    var dailyBtn = document.getElementById('dailyStartBtn');
    var order = [], qi = 0, score = 0, answered = false, mode = 'quiz';
    var selectedCat = 'all';
    var filterBox = document.getElementById('quizFilter');
    if (filterBox) {
      filterBox.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          selectedCat = b.getAttribute('data-cat') || 'all';
          filterBox.querySelectorAll('button').forEach(function(x){ x.classList.toggle('active', x === b); });
        });
      });
    }

    function loadStats(){
      try {
        return {
          xp: parseInt(localStorage.getItem('su_xp')||'0',10)||0,
          level: parseInt(localStorage.getItem('su_level')||'1',10)||1,
          streak: parseInt(localStorage.getItem('su_streak')||'0',10)||0,
          dailyDate: localStorage.getItem('su_daily_date')||'',
          dailyDone: localStorage.getItem('su_daily_done')==='1'
        };
      } catch(e){ return {xp:0,level:1,streak:0,dailyDate:'',dailyDone:false}; }
    }
    function saveStats(s){
      try {
        localStorage.setItem('su_xp', String(s.xp));
        localStorage.setItem('su_level', String(s.level));
        localStorage.setItem('su_streak', String(s.streak));
        if (s.dailyDate != null) localStorage.setItem('su_daily_date', s.dailyDate);
        if (s.dailyDone != null) localStorage.setItem('su_daily_done', s.dailyDone ? '1' : '0');
      } catch(e){}
    }
    function todayStr(){
      var d = new Date();
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    }
    function renderStats(){
      var s = loadStats();
      var need = 100;
      var pct = Math.min(100, Math.round((s.xp % need) / need * 100));
      var levelH = document.querySelector('#page-game .card-grid .rpg-card h4');
      if (levelH && /Level/.test(levelH.textContent||'')) {
        levelH.innerHTML = '<span class="ic">◆</span> Level '+s.level;
      }
      var firstCard = document.querySelector('#page-game .card-grid .rpg-card');
      if (firstCard) {
        var sr = firstCard.querySelector('.stat-row span:last-child');
        var bar = firstCard.querySelector('.bar > span');
        if (sr) sr.textContent = (s.xp % need)+' / '+need;
        if (bar) bar.style.width = pct+'%';
      }
      var dailyStatus = document.getElementById('dailyStatus');
      if (dailyStatus) {
        if (s.dailyDate === todayStr() && s.dailyDone) {
          dailyStatus.textContent = 'Selesai hari ini · Streak '+s.streak;
        } else {
          dailyStatus.textContent = 'Belum dikerjakan hari ini';
        }
      }
      var sb = document.getElementById('streakBadge');
      if (sb) sb.textContent = '🔥 Streak ' + (s.streak || 0);
    }
    function shuffle(arr){
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }
    function openQuiz(isDaily){
      if (!overlay || !qEl || !optsEl) {
        alert('Kuis belum siap. Muat ulang halaman.');
        return;
      }
      mode = isDaily ? 'daily' : 'quiz';
      if (isDaily) {
        var s = loadStats();
        var t = todayStr();
        if (s.dailyDate === t && s.dailyDone) {
          alert('Daily challenge hari ini sudah selesai. Kembali lagi besok!');
          return;
        }
        var seed = parseInt(t.replace(/-/g,''), 10);
        var idx = seed % quizBank.length;
        order = [quizBank[idx], quizBank[(idx+3)%quizBank.length], quizBank[(idx+7)%quizBank.length]];
        if (titleEl) titleEl.textContent = 'Daily Challenge';
      } else {
        var pool = quizBank;
        if (selectedCat && selectedCat !== 'all') {
          pool = quizBank.filter(function(q){ return q.cat === selectedCat; });
          if (!pool.length) pool = quizBank;
        }
        order = shuffle(pool).slice(0, Math.min(5, pool.length));
        if (titleEl) titleEl.textContent = selectedCat === 'all' ? 'Kuis' : ('Kuis · ' + selectedCat);
      }
      qi = 0; score = 0; answered = false;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      showQ();
    }
    function closeQuiz(){
      if (!overlay) return;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      renderStats();
    }
    function showQ(){
      answered = false;
      if (nextBtn) nextBtn.style.display = 'none';
      if (fbEl) fbEl.textContent = '';
      var item = order[qi];
      if (metaEl) metaEl.textContent = 'Soal '+(qi+1)+' / '+order.length+' · Skor '+score+(item.cat ? ' · '+item.cat : '');
      if (qEl) qEl.textContent = item.q;
      optsEl.innerHTML = '';
      item.opts.forEach(function(o, i){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-opt';
        b.textContent = o;
        b.addEventListener('click', function(){ pick(i); });
        optsEl.appendChild(b);
      });
    }
    function pick(i){
      if (answered) return;
      answered = true;
      var item = order[qi];
      var buttons = optsEl.querySelectorAll('.quiz-opt');
      for (var n = 0; n < buttons.length; n++) {
        buttons[n].disabled = true;
        if (n === item.ans) buttons[n].classList.add('correct');
        if (n === i && i !== item.ans) buttons[n].classList.add('wrong');
      }
      if (i === item.ans) {
        score++;
        if (fbEl) fbEl.textContent = 'Benar. ' + item.exp;
      } else {
        if (fbEl) fbEl.textContent = 'Belum tepat. ' + item.exp;
      }
      if (metaEl) metaEl.textContent = 'Soal '+(qi+1)+' / '+order.length+' · Skor '+score;
      if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.textContent = (qi + 1 >= order.length) ? 'Selesai' : 'Lanjut';
      }
    }
    function next(){
      if (qi + 1 >= order.length) {
        var s = loadStats();
        var gained = score * (mode === 'daily' ? 30 : 20);
        var prevLevel = s.level;
        s.xp += gained;
        while (s.xp >= 100) { s.xp -= 100; s.level += 1; }
        if (mode === 'daily') {
          s.dailyDate = todayStr();
          s.dailyDone = true;
          if (score >= 2) s.streak += 1; else s.streak = 0;
        } else if (score >= 4) {
          s.streak += 1;
        }
        saveStats(s);
        if (s.level > prevLevel && typeof window.__suLevelUp === 'function') {
          setTimeout(function(){ window.__suLevelUp(s.level); }, 400);
        }
        if (qEl) qEl.textContent = 'Selesai! Benar ' + score + ' dari ' + order.length + '.';
        optsEl.innerHTML = '';
        if (fbEl) fbEl.textContent = '+' + gained + ' XP · Level ' + s.level + (s.streak ? ' · Streak ' + s.streak : '');
        if (nextBtn) nextBtn.style.display = 'none';
        if (metaEl) metaEl.textContent = 'Hasil';
        renderStats();
        return;
      }
      qi++;
      showQ();
    }
    if (startBtn) startBtn.addEventListener('click', function(){ openQuiz(false); });
    if (dailyBtn) dailyBtn.addEventListener('click', function(){ openQuiz(true); });
    if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (overlay) overlay.addEventListener('click', function(e){ if (e.target === overlay) closeQuiz(); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeQuiz();
    });
    renderStats();
  })();


  /* ---------------- Bookmarks + Export notes ---------------- */
  (function(){
    function collectNotes(){
      var lines = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('su_note::') === 0) {
            var val = localStorage.getItem(k);
            if (val && val.trim()) {
              var parts = k.split('::');
              var subject = parts[1] || '';
              var title = parts.slice(2).join('::');
              lines.push('## ' + subject + ' — ' + title + '\n' + val.trim() + '\n');
            }
          }
        }
      } catch(e){}
      lines.sort();
      return lines;
    }
    function renderBookmarks(){
      var list = document.getElementById('bookmarkList');
      var empty = document.getElementById('bookmarkEmpty');
      if (!list || !empty) return;
      var items = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('su_bm::') === 0 && localStorage.getItem(k) === '1') {
            var parts = k.split('::');
            items.push({subject: parts[1], title: parts.slice(2).join('::')});
          }
        }
      } catch(e){}
      items.sort(function(a,b){ return (a.subject + a.title).localeCompare(b.subject + b.title); });
      if (!items.length) {
        empty.style.display = 'block';
        list.style.display = 'none';
        list.innerHTML = '';
        return;
      }
      empty.style.display = 'none';
      list.style.display = 'flex';
      list.innerHTML = items.map(function(it){
        return '<li><div><div class="bm-title">' + it.title.replace(/</g,'&lt;') + '</div><div class="bm-sub">' + it.subject.replace(/</g,'&lt;') + '</div></div>'
          + '<button type="button" class="bm-remove" data-subject="' + it.subject.replace(/"/g,'&quot;') + '" data-title="' + it.title.replace(/"/g,'&quot;') + '">Hapus</button></li>';
      }).join('');
      list.querySelectorAll('.bm-remove').forEach(function(btn){
        btn.addEventListener('click', function(){
          try { localStorage.removeItem('su_bm::' + btn.getAttribute('data-subject') + '::' + btn.getAttribute('data-title')); } catch(e){}
          renderBookmarks();
        });
      });
    }
    window.__suRenderBookmarks = renderBookmarks;

    var copyBtn = document.getElementById('exportCopyBtn');
    var dlBtn = document.getElementById('exportDownloadBtn');
    var status = document.getElementById('exportStatus');
    function setStatus(msg){ if (status) status.textContent = msg; }

    if (copyBtn) {
      copyBtn.addEventListener('click', function(){
        var lines = collectNotes();
        if (!lines.length) { setStatus('Belum ada catatan yang tersimpan.'); return; }
        var text = 'Catatan Science Universe\n' + new Date().toLocaleString('id-ID') + '\n\n' + lines.join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function(){
            setStatus('Catatan disalin ke clipboard (' + lines.length + ' topik).');
          }).catch(function(){ setStatus('Gagal menyalin. Coba unduh sebagai file.'); });
        } else {
          setStatus('Clipboard tidak tersedia. Gunakan unduh .txt');
        }
      });
    }
    if (dlBtn) {
      dlBtn.addEventListener('click', function(){
        var lines = collectNotes();
        if (!lines.length) { setStatus('Belum ada catatan yang tersimpan.'); return; }
        var text = 'Catatan Science Universe\n' + new Date().toLocaleString('id-ID') + '\n\n' + lines.join('\n');
        var blob = new Blob([text], {type:'text/plain;charset=utf-8'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'catatan-science-universe.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setStatus('File catatan-science-universe.txt diunduh (' + lines.length + ' topik).');
      });
    }
    var resetBtn = document.getElementById('resetAllBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function(){
        if (!confirm('Hapus tema, progres selesai, bookmark, XP, dan catatan?')) return;
        try {
          var keys = [];
          for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
          keys.forEach(function(k){ if (k && k.indexOf('su_') === 0) localStorage.removeItem(k); });
        } catch(e){}
        location.reload();
      });
    }
    document.querySelectorAll('[data-page="settings"]').forEach(function(b){
      b.addEventListener('click', function(){ setTimeout(renderBookmarks, 50); });
    });
    renderBookmarks();
  })();


  /* ---------------- Level-up animation ---------------- */
  (function(){
    var overlay = document.getElementById('levelupOverlay');
    var numEl = document.getElementById('levelupNumber');
    var subEl = document.getElementById('levelupSub');
    var closeBtn = document.getElementById('levelupClose');
    var particles = document.getElementById('levelupParticles');
    function hide(){
      if (!overlay) return;
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      if (particles) particles.innerHTML = '';
    }
    function show(level){
      if (!overlay) return;
      if (numEl) numEl.textContent = String(level);
      if (subEl) subEl.textContent = 'Level ' + level + ' tercapai. Lanjut kuis & daily challenge!';
      if (particles) {
        particles.innerHTML = '';
        var colors = ['#f0c96b', '#8b7cf6', '#4fd8e8', '#5fd99a', '#ff3d81', '#9b7ec8'];
        for (var i = 0; i < 28; i++) {
          var s = document.createElement('span');
          s.style.left = (10 + Math.random() * 80) + '%';
          s.style.top = (20 + Math.random() * 40) + '%';
          s.style.background = colors[i % colors.length];
          s.style.animationDelay = (Math.random() * 0.4) + 's';
          s.style.width = s.style.height = (5 + Math.random() * 8) + 'px';
          particles.appendChild(s);
        }
      }
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
    }
    window.__suLevelUp = show;
    if (closeBtn) closeBtn.addEventListener('click', hide);
    if (overlay) overlay.addEventListener('click', function(e){ if (e.target === overlay) hide(); });
  })();

  /* ---------------- Profile photo (local only) ---------------- */
  (function(){
    var input = document.getElementById('photoFileInput');
    var avatar = document.getElementById('gameAvatar');

    function applyPhoto(dataUrl){
      if (!dataUrl) return;
      if (avatar) {
        avatar.innerHTML = '';
        var aimg = document.createElement('img');
        aimg.src = dataUrl;
        aimg.alt = 'Avatar';
        avatar.appendChild(aimg);
      }
    }
    function load(){
      try {
        var saved = localStorage.getItem('su_photo');
        if (saved) applyPhoto(saved);
      } catch(e){}
    }
    function onFile(file){
      if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Maksimal sekitar 2.5 MB. Pilih foto yang lebih kecil.');
        return;
      }
      var reader = new FileReader();
      reader.onload = function(){
        var dataUrl = reader.result;
        var image = new Image();
        image.onload = function(){
          var max = 512;
          var w = image.width, h = image.height;
          if (w > max || h > max) {
            if (w > h) { h = Math.round(h * max / w); w = max; }
            else { w = Math.round(w * max / h); h = max; }
          }
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, w, h);
          var out = canvas.toDataURL('image/jpeg', 0.85);
          try { localStorage.setItem('su_photo', out); } catch(e) {
            alert('Gagal menyimpan foto (storage penuh). Coba foto lebih kecil.');
            return;
          }
          applyPhoto(out);
        };
        image.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
    function openPicker(e){
      if (e && e.target === input) return;
      if (input) input.click();
    }
    var gameWrap = document.getElementById('gameAvatarWrap');
    if (gameWrap && input) {
      gameWrap.addEventListener('click', openPicker);
    }
    if (input) {
      input.addEventListener('change', function(){
        if (input.files && input.files[0]) onFile(input.files[0]);
        input.value = '';
      });
    }
    load();
  })();

  /* ---------------- Browser notifications (daily reminder) ---------------- */
  (function(){
    var btn = document.getElementById('notifEnableBtn');
    var status = document.getElementById('notifStatus');
    function setStatus(msg){ if (status) status.textContent = msg; }
    function supported(){
      return typeof window.Notification !== 'undefined';
    }
    function updateLabel(){
      if (!supported()) {
        setStatus('Notifikasi tidak tersedia di browser ini.');
        if (btn) btn.disabled = true;
        return;
      }
      if (Notification.permission === 'granted') {
        setStatus('Aktif.');
        if (btn) btn.textContent = 'Cek pengingat';
      } else if (Notification.permission === 'denied') {
        setStatus('Diblokir di pengaturan browser.');
        if (btn) btn.textContent = 'Diblokir';
      } else {
        setStatus('');
        if (btn) btn.textContent = 'Aktifkan';
      }
    }
    function maybeNotifyDaily(){
      if (!supported() || Notification.permission !== 'granted') return;
      try {
        var done = localStorage.getItem('su_daily_done') === '1';
        var date = localStorage.getItem('su_daily_date') || '';
        var d = new Date();
        var today = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        if (date === today && done) return;
        var last = localStorage.getItem('su_notif_last') || '';
        if (last === today) return;
        localStorage.setItem('su_notif_last', today);
        var n = new Notification('Science Universe', {
          body: 'Daily challenge hari ini belum dikerjakan. Yuk 3 soal cepat!',
          tag: 'su-daily'
        });
        n.onclick = function(){ window.focus(); n.close(); };
      } catch(e){}
    }
    if (btn) {
      btn.addEventListener('click', function(){
        if (!supported()) { setStatus('Tidak didukung di browser ini.'); return; }
        if (Notification.permission === 'granted') {
          maybeNotifyDaily();
          setStatus('Pengingat dicek. Jika daily belum selesai, notifikasi dikirim.');
          return;
        }
        Notification.requestPermission().then(function(p){
          updateLabel();
          if (p === 'granted') maybeNotifyDaily();
        });
      });
    }
    updateLabel();
    setTimeout(maybeNotifyDaily, 2500);
  })();


  /* ---------------- Continue learning ---------------- */
  (function(){
    var card = document.getElementById('continueCard');
    var text = document.getElementById('continueText');
    var btn = document.getElementById('continueBtn');
    function update(){
      var title = '';
      try { title = localStorage.getItem('su_last_subject') || ''; } catch(e){}
      if (!title || !card) {
        if (card) card.classList.add('hidden');
        return;
      }
      card.classList.remove('hidden');
      if (text) text.textContent = 'Lanjutkan: ' + title;
    }
    window.__suUpdateContinue = update;
    if (btn) {
      btn.addEventListener('click', function(){
        var title = '';
        try { title = localStorage.getItem('su_last_subject') || ''; } catch(e){}
        if (!title) return;
        if (typeof showPage === 'function') showPage('materi');
        else {
          var b = document.querySelector('[data-page="materi"]');
          if (b) b.click();
        }
        setTimeout(function(){
          if (typeof window.__suOpenMateri === 'function') window.__suOpenMateri(title);
        }, 80);
      });
    }
    update();
  })();

/* ---------------- Theme switching ---------------- */
  var themeButtons = document.querySelectorAll('.theme-swatch');
  var savedTheme = 'cosmic';
  try { savedTheme = localStorage.getItem('su_theme') || 'cosmic'; } catch(e){}

  function applyTheme(name){
    if(name === 'pink' || name === 'lavender'){
      document.body.setAttribute('data-theme', name);
    } else {
      document.body.removeAttribute('data-theme');
    }
    themeButtons.forEach(function(b){ b.classList.toggle('selected', b.dataset.theme === name); });
    try { localStorage.setItem('su_theme', name); } catch(e){}
  }

  themeButtons.forEach(function(b){
    b.addEventListener('click', function(){ applyTheme(b.dataset.theme); });
  });

  applyTheme(savedTheme);
})();
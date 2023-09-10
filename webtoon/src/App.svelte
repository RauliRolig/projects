<script>
  import Kortti from './Kortti.svelte'; // Tuodaan Kortti-komponentti
  import { slide } from 'svelte/transition'; // Tuodaan transitiot
  import { quintOut, quintIn } from 'svelte/easing';
  import { Shadow } from 'svelte-loading-spinners'; // Tuodaan spinneri

  // Haetaan APIsta tiedot
  const getManga = async () => {
    const response = await fetch(
      `https://manga-scrapper.p.rapidapi.com/webtoons?provider=asura&page=6&limit=20`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key':
            ,
          'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
        },
      }
    );
    console.log(mangaFetch); // Tulostetaan mangaFetch-koodin arvo konsoliin
    if (!response.ok) {
      throw new Error('cannot fetch the data'); // Heitetään virhe, jos datan hakeminen ei onnistu
    }
    return await response.json(); // Palautetaan haettu data JSON-muodossa
  };

  let mangaFetch = getManga(); // Asetetaan JSON

  //genre lista
  let genret = [
    'Action',
    'Adventure',
    'Fantasy',
    'Comedy',
    'Shounen',
    'Martial Arts',
  ];
  let valitutGenret = []; // Alustetaan tyhjä taulukko valituille genreille
  let filteredManga = []; // Alustetaan tyhjä taulukko suodatetulle mangalle

  //Funktio jolla tarkistetaan JSONista ja valituista genreistä yhteiset genret
  async function filterManga() {
    try {
      mangaFetch = await getManga(); // Päivitetään mangaFetch uudelleen datan päivittämiseksi

      // Tyhjennetään filteredManga-taulukko, jotta voimme täyttää sen uudelleen
      filteredManga = [];

      for (let i = 0; i < mangaFetch.length; i++) {
        const manga = mangaFetch[i];
        // Tarkistetaan, että manga ja genre ovat määriteltyjä ja että valitut genret sisältyvät mangaan
        if (
          manga &&
          manga.genre &&
          valitutGenret.every((j) => manga.genre.includes(j))
        ) {
          filteredManga.push(manga); // Lisätään taulukkoon
        }
      }
    } catch (error) {
      console.error(error); // Tulostetaan mahdolliset virheet konsoliin
    }
  }

  let likes = 0; //Muuttuja valetykkäysten laskemiseen
  const liked = () => (likes = likes + 1); // Funktio tykkäyksille
</script>

<body>
  <main>
    <h1>Etsi webtoon genren perusteella</h1>
    <div>Tykätyt: {likes}</div>
    <div class="box">
      <p>Valitse genre?</p>
      {#each genret as genreOption}
        <label for={genreOption}>
          <input
            type="checkbox"
            value={genreOption}
            bind:group={valitutGenret}
            on:change={filterManga}
          />
          {genreOption}
        </label>
      {/each}
    </div>
    <div class="cards">
      {#if filteredManga.length === 0}
        <!--Jos taulukon pituus 0 niin spinneri pyörii, muuten näytetään kortteja-->
        <Shadow size="20" color="purple" unit="px" duration="1s" />
      {:else}
        {#each filteredManga as manga}
          <div
            in:slide={{
              delay: 300,
              duration: 500,
              easing: quintIn,
              axis: 'x',
            }}
            out:slide={{
              delay: 300,
              duration: 500,
              easing: quintOut,
              axis: 'y',
            }}
          >
            <!--Yhdessä kuvauksessa oli br tageja jotka piti poistaa-->
            <Kortti
              kuvaus={manga.synopsis.replaceAll('<br />', ' ')}
              nimi={manga.title}
              on:click={liked}
            />
          </div>
        {/each}
      {/if}
    </div>
  </main>
</body>

<style>
  body {
    text-align: center;
    padding: 1em;
    max-width: auto;
    margin: 0 auto;
    background-color: rgb(21, 18, 41);
    color: aliceblue;
  }
  .box {
    font-size: 1.5em;
  }
  .cards {
    padding-top: 1.5em;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background-color: rgb(21, 18, 41);
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

import fetch from 'node-fetch';
import readline from 'readline';

const OMDB_API_KEY = "56d18134";
const TMDB_API_KEY = "9f878a77f9008b506bbeec03b46a3e2e";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function fetchMovieData(title, year) {
    const omdbSite = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${OMDB_API_KEY}`;
    const tmdbSite = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&api_key=${TMDB_API_KEY}`;

    try {
        const [omdbResponse, tmdbSearchResponse] = await Promise.all([
            fetch(omdbSite).then(res => res.json()),
            fetch(tmdbSite).then(res => res.json())
        ]);


        //Professor, eu não sei se era para deixar o programa poder retornar tipo um filme com só as reviews caso ele
        //tivesse no TMDb mais não no OMDb, portanto eu fiz essa próxima parte para dar erro de busca se ele não tiver
        //no OMDb, não sei se fui cego e tinha algo no enunciado que não li, se sim peço perdão.


        if (!omdbResponse.Title) {
            throw new Error("Filme não encontrado na OMDb.");
        }

        const tmdbMovieId = tmdbSearchResponse.results.length > 0 ? tmdbSearchResponse.results[0].id : null;

        let reviews = ["Nenhuma review encontrada para este filme."];
        if (tmdbMovieId) {
            const tmdbReviewsUrl = `https://api.themoviedb.org/3/movie/${tmdbMovieId}/reviews?api_key=${TMDB_API_KEY}`;
            const tmdbReviewsResponse = await fetch(tmdbReviewsUrl).then(res => res.json());

            if (tmdbReviewsResponse.results && tmdbReviewsResponse.results.length > 0) {
                reviews = tmdbReviewsResponse.results.slice(0, 3).map(review =>
                    review.content.replace(/\r\n|\n/g, ' ')
                );
            }
        }

        const result = {
            titulo: omdbResponse.Title || "Faltou título",
            ano: omdbResponse.Year || "Falta Ano",
            sinopse: omdbResponse.Plot || "Faltou Sinospe",
            reviews: reviews
        };

        console.log("\nResultado:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Erro ao buscar os dados do filme:", error.message);
    }

    console.log("\n\n-----------------------------------");
    showMenu();
}

function showMenu() {
    console.log("\n\n🎬 Filtragem de Cineminha dos Cria:");
    console.log("1 - Buscar filme");
    console.log("2 - Sair");

    rl.question("\nEscolha uma opção: ", (option) => {
        if (option === "1") {
            rl.question("Digite o título do filme: ", (title) => {
                rl.question("Digite o ano do filme: ", (year) => {
                    fetchMovieData(title, year);
                });
            });
        } else if (option === "2") {
            console.log("\nEncerrando........");
            rl.close();
        } else {
            console.log("\nInválido!.");
            showMenu();
        }
    });
}



showMenu();
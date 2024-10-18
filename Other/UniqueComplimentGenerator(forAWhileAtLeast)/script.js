const complimentsPart1 =
[
    "Tarihteki en etkileyici, ",
    "Evrendeki en inanılmaz, ",
    "İnsanlık tarihindeki en, ",
    "Yaşamın sunduğu en, ",
    "Dünyadaki en, ",
    "Hayatımda gördüğüm en, ",
    "Tüm varoluştaki en, ",
    "Görünen evrendeki en, "
];
const complimentsPart2 =
[
    "goth",
    "Allahsız",
    "çalışkan",
    "tatlış",
    "HOT",
];

usedCompliments = [[-1, -1]]

function generateCompliment()
{
    randomIndex1 = -1;
    randomIndex2 = -1;

    do
    {
        randomIndex1 = Math.floor(Math.random() * complimentsPart1.length);
        randomIndex2 = Math.floor(Math.random() * complimentsPart2.length);
    } while (usedCompliments.includes([randomIndex1, randomIndex2]));

    usedCompliments.push([randomIndex1, randomIndex2])

    if (usedCompliments.length > complimentsPart1[randomIndex1] * complimentsPart2[randomIndex2])
    {
        usedCompliments = [[-1, -1]]
    }

    document.getElementById('compliment').innerText = complimentsPart1[randomIndex1] + complimentsPart2[randomIndex2] + " queensin ❣️";
}


function generate_random_color() {
    return Math.floor(Math.random() * 16 ** 6).toString(16).padStart(6, "0");
}

let random_color = generate_random_color();

function profile_image(seed, skin_color = 0) {

    const skin = ["f2d3b1",
        "ecad80",
        "9e5622",
        "763900"];

    const img = document.getElementById('profile-img');
    img.src = img.src = 'https://api.dicebear.com/8.x/adventurer/svg?backgroundColor=' + random_color + '&seed=' + seed
        + '&skinColor=' + skin[skin_color];
    document.getElementById('image').value = img.src;
    document.getElementById('color').value = random_color;

    img.onclick = function () {
        random_color = generate_random_color();
        img.src = 'https://api.dicebear.com/8.x/adventurer/svg?backgroundColor=' + random_color + '&seed=' + seed
            + '&skinColor=' + skin[skin_color];
        document.getElementById('image').value = img.src;
        document.getElementById('color').value = random_color;
    };
}



document.getElementById('name').oninput = function () {
    let skin_color = Math.floor(Math.random() * 3);
    profile_image(this.value, skin_color);
};

profile_image("");
const img = document.getElementById('profile-img');
img.style.width = '100px';
img.style.height = '100px';
img.style.borderRadius = '10%';
img.style.padding = '5px';
img.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
img.style.transition = '0.5s';
img.style.cursor = 'pointer';
img.addEventListener('mouseover', function () {
    img.style.transform = 'scale(1.1)';
});
img.addEventListener('mouseout', function () {
    img.style.transform = 'scale(1)';
});

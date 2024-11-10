// read cookie user
const user = document.cookie.split('; ').find(row => row.startsWith('user_id='));
const user_name = document.cookie.split('; ').find(row => row.startsWith('user_name='));
const user_image = document.cookie.split('; ').find(row => row.startsWith('user_image='));
const user_color = document.cookie.split('; ').find(row => row.startsWith('user_color='));

//si la cookie no existeix redirigir a login
if (!user || !user_name) {
    window.location.href = "/login";
} else {
    // Agafar el valor de la cookie
    const userId = user.split('=')[1];
    const userName = user_name.split('=')[1];
    const userColor = user_color.split('=')[1];

    // split
    const user_image64 = user_image.replace('user_image=', '')
    const userImage = atob(user_image64);

    if(localStorage.getItem('userId') !== userId){
        localStorage.clear();
    }

    // put to local storage
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userImage', userImage);
    localStorage.setItem('userColor', userColor);

    // Situa el nom de l'usuari
    const profileName = document.querySelectorAll('.profile-name');
    profileName.forEach(name => {
        name.innerHTML = userName;
    });
    // Situa la imatge de l'usuari
    const profileImage = document.querySelectorAll('.profile-image');
    profileImage.forEach(image => {
        image.src = userImage;
    });

}



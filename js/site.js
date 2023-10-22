const displayMessage = () => {
    const msg = document.getElementById("message").value;
    Swal.fire(
        {
            backdrop: false,
            title: 'App Name',
            text: msg
        }
    );
}
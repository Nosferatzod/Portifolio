document.addEventListener('DOMContentLoaded', function() {
    function enviarFormulario(form, formspreeURL) {
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        fetch(formspreeURL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Mensagem enviada com sucesso!');
                form.reset();
            } else {
                alert('Erro ao enviar a mensagem. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao enviar a mensagem.');
        });
    }

    const contatoForm = document.getElementById('contatoForm');
    if (contatoForm) {
        const formspreeURLContato = 'https://formspree.io/f/xovqdvjq'; // URL para o Formspree de contato
        contatoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            enviarFormulario(contatoForm, formspreeURLContato);
        });
    }
});

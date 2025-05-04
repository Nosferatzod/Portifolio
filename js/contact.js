document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if(contactForm) {
        // Validação em tempo real
        const validateField = (field, errorId, validationFn) => {
            const errorElement = document.getElementById(errorId);
            const formGroup = field.closest('.form-group');
            
            field.addEventListener('input', () => {
                if (validationFn(field.value)) {
                    formGroup.classList.remove('invalid');
                    errorElement.textContent = '';
                }
            });
            
            field.addEventListener('blur', () => {
                if (!validationFn(field.value)) {
                    formGroup.classList.add('invalid');
                }
            });
        };

        // Validações individuais
        validateField(contactForm.name, 'name-error', value => value.length >= 3);
        validateField(contactForm.email, 'email-error', value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        validateField(contactForm.subject, 'subject-error', value => value.length >= 5);
        validateField(contactForm.message, 'message-error', value => value.length >= 10);

        // Envio do formulário
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar todos os campos antes de enviar
            let isValid = true;
            
            // Validação do nome
            if (contactForm.name.value.length < 3) {
                document.getElementById('name-error').textContent = 'Nome deve ter pelo menos 3 caracteres';
                contactForm.name.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
            // Validação do email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.value)) {
                document.getElementById('email-error').textContent = 'Por favor, insira um email válido';
                contactForm.email.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
            // Validação do assunto
            if (contactForm.subject.value.length < 5) {
                document.getElementById('subject-error').textContent = 'Assunto deve ter pelo menos 5 caracteres';
                contactForm.subject.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
            // Validação da mensagem
            if (contactForm.message.value.length < 10) {
                document.getElementById('message-error').textContent = 'Mensagem deve ter pelo menos 10 caracteres';
                contactForm.message.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
            if (!isValid) {
                formStatus.textContent = 'Por favor, corrija os erros no formulário.';
                formStatus.className = 'form-status error';
                return;
            }
            
            // Desativar o botão de envio
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    formStatus.textContent = 'Mensagem enviada com sucesso! Entrarei em contato em breve.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao enviar o formulário');
                }
            } catch (error) {
                console.error('Erro:', error);
                formStatus.textContent = 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensagem';
                
                // Rolar para a mensagem de status
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
    
});

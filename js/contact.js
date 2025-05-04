document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if(contactForm) {
        // Validação em tempo real
        const validateField = (field, errorId, validationFn, errorMessage) => {
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
                    errorElement.textContent = errorMessage;
                }
            });
        };

        // Configurações de validação
        validateField(
            contactForm.name, 
            'name-error', 
            value => value.length >= 3,
            'Nome deve ter pelo menos 3 caracteres'
        );
        
        validateField(
            contactForm.email, 
            'email-error', 
            value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            'Por favor, insira um email válido'
        );
        
        validateField(
            contactForm.subject, 
            'subject-error', 
            value => value.length >= 5,
            'Assunto deve ter pelo menos 5 caracteres'
        );
        
        validateField(
            contactForm.message, 
            'message-error', 
            value => value.length >= 10,
            'Mensagem deve ter pelo menos 10 caracteres'
        );

        // Envio do formulário
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar todos os campos antes de enviar
            let isValid = true;
            
            if (contactForm.name.value.length < 3) {
                document.getElementById('name-error').textContent = 'Nome deve ter pelo menos 3 caracteres';
                contactForm.name.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.value)) {
                document.getElementById('email-error').textContent = 'Por favor, insira um email válido';
                contactForm.email.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
            if (contactForm.subject.value.length < 5) {
                document.getElementById('subject-error').textContent = 'Assunto deve ter pelo menos 5 caracteres';
                contactForm.subject.closest('.form-group').classList.add('invalid');
                isValid = false;
            }
            
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
            formStatus.textContent = '';
            formStatus.className = '';
            
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
                    const error = await response.json();
                    throw new Error(error.error || 'Erro ao enviar o formulário');
                }
            } catch (error) {
                console.error('Erro:', error);
                formStatus.textContent = 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensagem';
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
});
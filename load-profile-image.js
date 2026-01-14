/**
 * Script para carregar imagem do perfil na página seguinte
 * Inclua este script em qualquer página que precise da foto do perfil
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🖼️ [PROFILE] Iniciando carregamento da imagem do perfil...');
    
    // Função para carregar imagem do localStorage
    function loadProfileImageFromStorage() {
        const savedImage = localStorage.getItem('profileImage');
        const savedPhone = localStorage.getItem('profilePhone');
        
        console.log('💾 [PROFILE] Verificando localStorage:', {
            hasImage: !!savedImage,
            hasPhone: !!savedPhone,
            imageUrl: savedImage ? savedImage.substring(0, 50) + '...' : 'N/A'
        });
        
        if (!savedImage) {
            console.log('❌ [PROFILE] Nenhuma imagem encontrada no localStorage');
            return false;
        }
        
        // Lista de IDs possíveis para a imagem do perfil
        const profileImageIds = [
            'profile-pic',
            'profileImage', 
            'userPhoto',
            'targetPhoto',
            'placeholderPhoto'
        ];
        
        let imageUpdated = false;
        
        profileImageIds.forEach(id => {
            const element = document.getElementById(id);
            
            if (element) {
                console.log(`🔍 [PROFILE] Elemento encontrado: ${id}`);
                
                // Se o elemento é uma imagem diretamente
                if (element.tagName === 'IMG') {
                    element.src = savedImage;
                    console.log(`✅ [PROFILE] Imagem atualizada em IMG#${id}`);
                    imageUpdated = true;
                }
                // Se o elemento contém uma imagem
                else {
                    const imgElement = element.querySelector('img');
                    if (imgElement) {
                        imgElement.src = savedImage;
                        console.log(`✅ [PROFILE] Imagem atualizada em IMG dentro de #${id}`);
                        imageUpdated = true;
                    }
                }
            }
        });
        
        // Buscar por classes também
        const profileImageClasses = [
            '.profile-image',
            '.user-photo',
            '.target-photo',
            '.profile-pic'
        ];
        
        profileImageClasses.forEach(className => {
            const elements = document.querySelectorAll(className);
            elements.forEach((element, index) => {
                if (element.tagName === 'IMG') {
                    element.src = savedImage;
                    console.log(`✅ [PROFILE] Imagem atualizada em IMG${className}[${index}]`);
                    imageUpdated = true;
                } else {
                    const imgElement = element.querySelector('img');
                    if (imgElement) {
                        imgElement.src = savedImage;
                        console.log(`✅ [PROFILE] Imagem atualizada em IMG dentro de ${className}[${index}]`);
                        imageUpdated = true;
                    }
                }
            });
        });
        
        if (imageUpdated) {
            console.log('🎉 [PROFILE] Imagem do perfil carregada com sucesso!');
            
            // Adicionar informações do telefone se houver elemento para isso
            if (savedPhone) {
                const phoneElements = document.querySelectorAll('[data-phone], .phone-number, #phone-display');
                phoneElements.forEach(element => {
                    element.textContent = savedPhone;
                    console.log('📱 [PROFILE] Telefone atualizado:', savedPhone);
                });
            }
        } else {
            console.log('⚠️ [PROFILE] Nenhum elemento de imagem encontrado para atualizar');
        }
        
        return imageUpdated;
    }
    
    // Carregar imagem imediatamente
    const loaded = loadProfileImageFromStorage();
    
    // Se não carregou, tentar novamente após um pequeno delay
    // (útil se a página ainda está carregando elementos dinamicamente)
    if (!loaded) {
        console.log('🔄 [PROFILE] Tentando novamente em 1 segundo...');
        setTimeout(() => {
            loadProfileImageFromStorage();
        }, 1000);
    }
    
    // Função global para recarregar imagem (pode ser chamada manualmente)
    window.reloadProfileImage = loadProfileImageFromStorage;
    
    // Função global para verificar se há imagem salva
    window.hasProfileImage = function() {
        const savedImage = localStorage.getItem('profileImage');
        return savedImage && savedImage.trim() !== '';
    };
    
    // Função global para obter dados do perfil
    window.getProfileData = function() {
        return {
            image: localStorage.getItem('profileImage'),
            phone: localStorage.getItem('profilePhone')
        };
    };
    
    console.log('🚀 [PROFILE] Script de carregamento de perfil inicializado');
});


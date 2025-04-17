export const createFileTransferAnimation = (
  sourceElement: HTMLElement,
  targetElements: HTMLElement[],
  fileCount: number = 1
) => {
  const sourceRect = sourceElement.getBoundingClientRect();
  const particleCount = Math.min(fileCount * 2, 10);

  targetElements.forEach(targetElement => {
    const targetRect = targetElement.getBoundingClientRect();
    
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'file-transfer-particle';
        
        const randomX = Math.random() * (sourceRect.width - 30);
        const randomY = Math.random() * (sourceRect.height - 30);
        
        const targetX = targetRect.left + (targetRect.width / 2) - (sourceRect.left + randomX);
        const targetY = targetRect.top + (targetRect.height / 2) - (sourceRect.top + randomY);
        
        particle.style.left = `${sourceRect.left + randomX}px`;
        particle.style.top = `${sourceRect.top + randomY}px`;
        
        particle.style.setProperty('--target-x', `${targetX}px`);
        particle.style.setProperty('--target-y', `${targetY}px`);
        
        document.body.appendChild(particle);
        particle.addEventListener('animationend', () => {
          particle.remove();
        });
      }, i * 100);
    }
  });
};
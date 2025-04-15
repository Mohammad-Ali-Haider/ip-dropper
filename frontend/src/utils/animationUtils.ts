export const createFileTransferAnimation = (
  sourceElement: HTMLElement,
  targetElements: HTMLElement[],
  fileCount: number = 1
) => {
  const sourceRect = sourceElement.getBoundingClientRect();
  const particleCount = Math.min(fileCount * 2, 10); // Cap at 10 particles per device

  targetElements.forEach(targetElement => {
    const targetRect = targetElement.getBoundingClientRect();
    
    // Create multiple particles per target
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'file-transfer-particle';
        
        // Random starting position within the source element
        const randomX = Math.random() * (sourceRect.width - 30);
        const randomY = Math.random() * (sourceRect.height - 30);
        
        // Calculate target position
        const targetX = targetRect.left + (targetRect.width / 2) - (sourceRect.left + randomX);
        const targetY = targetRect.top + (targetRect.height / 2) - (sourceRect.top + randomY);
        
        // Set initial position
        particle.style.left = `${sourceRect.left + randomX}px`;
        particle.style.top = `${sourceRect.top + randomY}px`;
        
        // Set custom properties for animation
        particle.style.setProperty('--target-x', `${targetX}px`);
        particle.style.setProperty('--target-y', `${targetY}px`);
        
        // Add to DOM and remove after animation
        document.body.appendChild(particle);
        particle.addEventListener('animationend', () => {
          particle.remove();
        });
      }, i * 100); // Stagger the animations
    }
  });
};
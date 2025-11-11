// Class to check each services
// Can be used for debug ?
class HealthChecker {

		// Update status style
	private async updateStatus(
		dot: HTMLElement | null,
		label: HTMLElement | null,
		isOnline: boolean,
		onlineText = 'Ready',
		offlineText = 'Offline'
	) {
		if (!dot || !label) return;

		// Update the dot
		dot.className = `w-3 h-3 rounded-full bg-${isOnline ? 'green' : 'red'}-400 ${isOnline ? 'animate-pulse' : ''}`;

		// Update the label (text and color) — DO NOT add ml-auto here
		label.textContent = isOnline ? onlineText : offlineText;
		label.className = `text-${isOnline ? 'green' : 'red'}-400 text-sm font-mono`;

		// Update the parent container opacity
		// const parent = dot.closest('.flex'); // find the nearest flex container
		const parent = dot.closest('.flex')?.parentElement;
		if (parent) {
			if (isOnline) {
				parent.classList.remove('opacity-50');
			} else {
				parent.classList.add('opacity-50');
			}
		}
	}

    private async checkNginx(): Promise<boolean> {
        const nginxDot = document.getElementById('nginx-status');
        const nginxLabel = nginxDot?.nextElementSibling?.nextElementSibling as HTMLElement;

        try {
            const response = await fetch('/health');
            if (response.ok) {
                await this.updateStatus(nginxDot, nginxLabel, true);
                return true;
            } else {
                throw new Error('Nginx offline');
            }
        } catch (error) {
            console.warn('Nginx check failed:', error);
            await this.updateStatus(nginxDot, nginxLabel, false);
            return false;
        }
    }

	private async checkUsers(): Promise<boolean> {
        const usersDot= document.getElementById('users-status');
        const usersLabel = usersDot?.nextElementSibling?.nextElementSibling as HTMLElement;
		try {
			const response = await fetch('/api/users');  
			const data = await response.json();
			
			if (response.ok && usersDot) {
				await this.updateStatus(usersDot, usersLabel, true);
				return true;
			} else {
				throw new Error('users offline');
			}
		} catch (error) {
				console.warn('users check failed:', error);
				await this.updateStatus(usersDot, usersLabel, false);
			return false;
		}
	}

	private async checkRedis(): Promise<boolean> {
        const redisDot = document.getElementById('redis-status');
        const redisLabel = redisDot?.nextElementSibling?.nextElementSibling as HTMLElement;
		try {
			const response = await fetch('/api/redis');  
			const data = await response.json();
			
			if (response.ok && redisDot) {
				await this.updateStatus(redisDot, redisLabel, true);
				return true;
			} else {
				throw new Error('Redis offline');
			}
		} catch (error) {
				console.warn('Redis check failed:', error);
				await this.updateStatus(redisDot, redisLabel, false);
			return false;
		}
	}

    private async checkAPI(): Promise<boolean> {
        const apiDot = document.getElementById('api-status');
        const apiLabel = apiDot?.nextElementSibling?.nextElementSibling as HTMLElement;
        const apiBlock = apiDot?.parentElement;

        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            // const healthy = data.status === 'ok' || data.status === 'healthy';
	
            if (response.ok) {
            	await this.updateStatus(apiDot, apiLabel, true);
                return true;
            } else {
                throw new Error('API offline');
            }
        } catch (error) {
            console.warn('API check failed:', error);
            await this.updateStatus(apiDot, apiLabel, false);
            return false;
        }
    }

    private async checkAllServices(): Promise<void> {
        const statusElement = document.getElementById('status');
        const nginxOnline = await this.checkNginx();
        const apiOnline = await this.checkAPI();
        const usersOnline = await this.checkUsers();
        const redisOnline = await this.checkRedis();

        if (statusElement) {
            if (nginxOnline && apiOnline && redisOnline && usersOnline) {
                statusElement.textContent = 'Online';
                statusElement.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white';
            } else {
                statusElement.textContent = '✗ Offline';
                statusElement.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white';
            }
        }
    }

    public async checkHealth(): Promise<void> {
        await this.checkAllServices();
    }
}

class TranscendenceApp {
    private startTime: number;
    private healthChecker: HealthChecker;

    constructor() {
        this.startTime = Date.now();
		this.healthChecker = new HealthChecker(); // ✅ integrate HealthChecker
        this.init();
    }

    private init(): void {
        this.updateTime();
        this.updateUptime();
        this.createParticles();
        this.setupEventListeners();
        
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateUptime(), 1000);
	   // ✅ Correct way to call health check
        setInterval(() => this.healthChecker.checkHealth(), 1000); // poll every 1s
        this.healthChecker.checkHealth(); // initial check
    }

    private updateTime(): void {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const timeElement = document.getElementById('server-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    private updateUptime(): void {
        const elapsed = Date.now() - this.startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = uptimeString;
        }
    }

    private createParticles(): void {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-white rounded-full opacity-30';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(particle);
        }
    }

	private setupEventListeners(): void {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.animateRefresh(refreshBtn);
                this.healthChecker.checkHealth(); // call HealthChecker
            });
        }
    }

    private animateRefresh(button: HTMLElement): void {
        button.classList.add('rotate-180');
        button.textContent = '↻ Refreshing...';
        
        setTimeout(() => {
            button.classList.remove('rotate-180');
            button.textContent = 'Refresh Status';
        }, 1000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TranscendenceApp();
});

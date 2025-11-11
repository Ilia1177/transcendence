"use strict";
class TranscendenceApp {
    constructor() {
        this.startTime = Date.now();
        this.init();
    }
    init() {
        this.updateTime();
        this.updateUptime();
        this.createParticles();
        this.setupEventListeners();
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateUptime(), 1000);
        setInterval(() => this.checkHealth(), 30000);
    }
    updateTime() {
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
    updateUptime() {
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
    async checkHealth() {
        var _a;
        const statusElement = document.getElementById('status');
        const nginxStatus = document.getElementById('nginx-status');
        const apiStatus = document.getElementById('api-status');
        const apiBlock = apiStatus === null || apiStatus === void 0 ? void 0 : apiStatus.parentElement;
        const apiLabel = (_a = apiStatus === null || apiStatus === void 0 ? void 0 : apiStatus.nextElementSibling) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
        try {
            const nginxResponse = await fetch('/health');
            if (nginxResponse.ok && nginxStatus) {
                nginxStatus.className = 'w-3 h-3 rounded-full bg-green-400 animate-pulse';
                if (statusElement) {
                    statusElement.textContent = '✓ Online';
                    statusElement.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white';
                }
            }
            else {
                throw new Error('Nginx offline');
            }
            const apiResponse = await fetch('/api/health');
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                if (data.status === 'ok' || data.status === 'healthy') {
                    if (apiStatus && apiBlock && apiLabel) {
                        apiBlock.classList.remove('opacity-50');
                        apiStatus.className = 'w-3 h-3 rounded-full bg-green-400 animate-pulse';
                        apiLabel.textContent = 'Ready';
                        apiLabel.className = 'ml-auto text-green-400 text-sm font-mono';
                    }
                }
            }
            else {
                throw new Error('API offline');
            }
        }
        catch (error) {
            console.warn('Health check failed:', error);
            if (statusElement) {
                statusElement.textContent = '✗ Offline';
                statusElement.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white';
            }
            if (nginxStatus)
                nginxStatus.className = 'w-3 h-3 rounded-full bg-red-500';
            if (apiStatus && apiBlock && apiLabel) {
                apiBlock.classList.add('opacity-100');
                apiStatus.className = 'w-3 h-3 rounded-full bg-red-500';
                apiLabel.textContent = 'Offline';
                apiLabel.className = 'ml-auto text-red-400 text-sm font-mono';
            }
        }
    }
    createParticles() {
        const container = document.getElementById('particles');
        if (!container)
            return;
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
    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.checkHealth();
                this.animateRefresh(refreshBtn);
            });
        }
    }
    animateRefresh(button) {
        button.classList.add('rotate-180');
        button.textContent = '↻ Refreshing...';
        setTimeout(() => {
            button.classList.remove('rotate-180');
            button.textContent = 'Refresh Status';
        }, 1000);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new TranscendenceApp();
});

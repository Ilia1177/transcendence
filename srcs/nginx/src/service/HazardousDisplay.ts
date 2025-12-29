export class HazardousDisplay {
  screen: HTMLElement;
  main: HTMLElement;
  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  terminal: HTMLElement;
  // output: HTMLPreElement

  constructor() {
    this.main = document.createElement('div');
    this.screen = document.createElement('div');
    this.terminal = document.createElement('div');
    this.terminal.className = 'w-full h-full flex items-center justify-center p-8';
    this.screen.className = 'hidden fixed inset-0 z-50 bg-black overflow-y-auto';
    this.main.className = 'w-full h-full flex flex-row'; // ← HORIZONTAL layout!

    // this.terminal.appendChild(this.output)
    this.main.appendChild(this.terminal);
    this.screen.appendChild(this.main);
    document.body.appendChild(this.screen);
  }

  async accesHazardousCollective(): Promise<void> {
    try {
      const response = await fetch('/api/hazardous/', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.sessionId) {
        console.log(data);
      } else {
        throw new Error(data.message || 'Failed to acces hazardous collective');
      }
    } catch (error) {
      alert('Failed to connect to hazardous service. Please try again.');
      throw error; // Re-throw so display() knows it failed
    }
  }

  async drawWelcomeScreen(): Promise<void> {
    console.log('draw terminal');
    // Clear any existing content
    this.main.innerHTML = '';
    const character = document.createElement('pre');
    character.className = 'text-green-500 font-mono text-sm leading-tight';
    character.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
    // Add blinking cursor
    const cursor = document.createElement('span');
    cursor.className = 'inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse';
    cursor.style.animation = 'blink 1s step-end infinite';
    this.terminal.appendChild(character);
    this.main.appendChild(this.terminal);
    // Start typing animation
    await this.typeText(character, this.getWelcomeAsciiArt(), 2);

    // Add cursor at the end
    character.appendChild(cursor);
    // Add CSS animation for cursor blink
    this.addCursorAnimation();
    // Add command prompt
    // await this.startCommandPrompt()
  }

  private typeText(element: HTMLPreElement, text: string, speed: number = 2): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;
      console.log('type text:)');

      const type = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;

          // Variable speed for more realistic typing
          // Faster for spaces and newlines, slower for other characters
          const char = text.charAt(index - 1);
          const delay = char === '\n' ? 20 : char === ' ' ? 5 : speed;

          setTimeout(type, delay);
        } else {
          resolve();
        }
      };

      type();
    });
  }

  private addCursorAnimation(): void {
    // Check if style already exists
    if (document.getElementById('cursor-blink-style')) return;

    const style = document.createElement('style');
    style.id = 'cursor-blink-style';
    style.textContent = `
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  private getWelcomeAsciiArt(): string {
    console.log(this.main);
    return `
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
─██████──██████─██████████████─██████████████████─██████████████─████████████████───████████████───██████████████─██████──██████─██████████████─
─██░░██──██░░██─██░░░░░░░░░░██─██░░░░░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░░░░░░░░░██───██░░░░░░░░████─██░░░░░░░░░░██─██░░██──██░░██─██░░░░░░░░░░██─
─██░░██──██░░██─██░░██████░░██─████████████░░░░██─██░░██████░░██─██░░████████░░██───██░░████░░░░██─██░░██████░░██─██░░██──██░░██─██░░██████████─
─██░░██──██░░██─██░░██──██░░██─────────████░░████─██░░██──██░░██─██░░██────██░░██───██░░██──██░░██─██░░██──██░░██─██░░██──██░░██─██░░██─────────
─██░░██████░░██─██░░██████░░██───────████░░████───██░░██████░░██─██░░████████░░██───██░░██──██░░██─██░░██──██░░██─██░░██──██░░██─██░░██████████─
─██░░░░░░░░░░██─██░░░░░░░░░░██─────████░░████─────██░░░░░░░░░░██─██░░░░░░░░░░░░██───██░░██──██░░██─██░░██──██░░██─██░░██──██░░██─██░░░░░░░░░░██─
─██░░██████░░██─██░░██████░░██───████░░████───────██░░██████░░██─██░░██████░░████───██░░██──██░░██─██░░██──██░░██─██░░██──██░░██─██████████░░██─
─██░░██──██░░██─██░░██──██░░██─████░░████─────────██░░██──██░░██─██░░██──██░░██─────██░░██──██░░██─██░░██──██░░██─██░░██──██░░██─────────██░░██─
─██░░██──██░░██─██░░██──██░░██─██░░░░████████████─██░░██──██░░██─██░░██──██░░██████─██░░████░░░░██─██░░██████░░██─██░░██████░░██─██████████░░██─
─██░░██──██░░██─██░░██──██░░██─██░░░░░░░░░░░░░░██─██░░██──██░░██─██░░██──██░░░░░░██─██░░░░░░░░████─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░░░░░░░██─
─██████──██████─██████──██████─██████████████████─██████──██████─██████──██████████─████████████───██████████████─██████████████─██████████████─
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

                                        ██████████████████████████████████████████████████████████
                                        █─▄▄▄─█─▄▄─█▄─▄███▄─▄███▄─▄▄─█─▄▄▄─█─▄─▄─█▄─▄█▄─█─▄█▄─▄▄─█
                                        █─███▀█─██─██─██▀██─██▀██─▄█▀█─███▀███─████─███▄▀▄███─▄█▀█
                                        ▀▄▄▄▄▄▀▄▄▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▀▄▄▄▀▀▄▄▄▀▀▀▄▀▀▀▄▄▄▄▄▀
    Press any key to continue...
    `;
  }

  display() {
    console.log('hazardous display');
    document.getElementById('first-screen')?.classList.add('hidden');
    this.screen.classList.remove('hidden');
    this.drawWelcomeScreen(); // Fire and forget
  }

  private async startCommandPrompt(): Promise<void> {
    this.main.innerHTML = '';

    const terminal = document.createElement('div');
    terminal.className = 'w-full h-full p-8 text-green-500 font-mono text-sm overflow-y-auto';
    terminal.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.5)';

    const output = document.createElement('div');
    output.id = 'terminal-output';

    const inputLine = document.createElement('div');
    inputLine.className = 'flex items-center mt-2';

    const prompt = document.createElement('span');
    prompt.textContent = '> ';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'flex-1 bg-transparent border-none outline-none text-green-500 font-mono';
    input.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
    input.placeholder = 'Enter command...';

    inputLine.appendChild(prompt);
    inputLine.appendChild(input);

    terminal.appendChild(output);
    terminal.appendChild(inputLine);
    this.main.appendChild(terminal);

    // Focus input
    input.focus();

    // Handle commands
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const command = input.value.trim();
        if (command) {
          await this.handleCommand(command, output);
          input.value = '';
        }
      }
    });
  }

  private async handleCommand(command: string, output: HTMLElement): Promise<void> {
    // Echo command
    this.addTerminalLine(output, `> ${command}`, 'text-green-500');

    const cmd = command.toLowerCase();

    switch (cmd) {
      case 'help':
        this.addTerminalLine(output, 'Available commands:', 'text-green-400');
        this.addTerminalLine(output, '  help     - Show this help', 'text-gray-400');
        this.addTerminalLine(output, '  status   - Check system status', 'text-gray-400');
        this.addTerminalLine(output, '  login    - Access system', 'text-gray-400');
        this.addTerminalLine(output, '  exit     - Exit terminal', 'text-gray-400');
        break;

      case 'status':
        await this.typeTerminalLine(output, 'System Status: ONLINE', 'text-green-400');
        await this.typeTerminalLine(output, 'Security: ACTIVE', 'text-yellow-400');
        break;

      case 'login':
        await this.typeTerminalLine(output, 'Authenticating...', 'text-yellow-400');
        await this.accesHazardousCollective();
        await this.typeTerminalLine(output, 'Access granted!', 'text-green-400');
        // Transition to main interface
        // setTimeout(() => this.startMainInterface(), 1000)
        break;

      case 'exit':
        await this.typeTerminalLine(output, 'Goodbye!', 'text-red-400');
        setTimeout(() => {
          document.getElementById('first-screen')?.classList.remove('hidden');
          this.screen.classList.add('hidden');
        }, 1000);
        break;

      default:
        this.addTerminalLine(output, `Command not found: ${command}`, 'text-red-400');
        this.addTerminalLine(output, 'Type "help" for available commands', 'text-gray-400');
    }

    // Auto-scroll to bottom
    output.scrollTop = output.scrollHeight;
  }

  private addTerminalLine(
    output: HTMLElement,
    text: string,
    className: string = 'text-green-500',
  ): void {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
  }

  private async typeTerminalLine(
    output: HTMLElement,
    text: string,
    className: string = 'text-green-500',
  ): Promise<void> {
    const line = document.createElement('div');
    line.className = className;
    output.appendChild(line);

    for (let i = 0; i < text.length; i++) {
      line.textContent += text.charAt(i);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
}

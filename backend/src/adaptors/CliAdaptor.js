import BotAdaptor from './BotAdaptor.js';
import { spawn } from 'child_process';

/**
 * Adaptor for CLI-based agents (e.g., Claude Code, Aider)
 */
export default class CliAdaptor extends BotAdaptor {
  constructor(config) {
    super(config);
    this.isBusy = false;
  }

  async initialize() {
    console.log(`[CliAdaptor] Initializing CLI: ${this.config.command}`);
    if (!this.config.command) throw new Error('Command is required');
    
    // Check if command exists
    return new Promise((resolve, reject) => {
        const check = spawn(this.config.command, ['--version'], { 
            cwd: this.config.cwd || process.cwd(),
            shell: true // Use shell to resolve command in path
        });
        
        check.on('error', (err) => {
            console.error(`[CliAdaptor] Command not found: ${this.config.command}`, err);
            // Don't fail init hard, just warn? Or fail?
            // If command is missing, chat will fail anyway.
            // Let's resolve false but log error.
            resolve(false); 
        });

        check.on('close', (code) => {
            if (code === 0) resolve(true);
            else {
                console.warn(`[CliAdaptor] Command check exited with code ${code}`);
                resolve(true); // Assume it might just not support --version
            }
        });
    });
  }

  async chat(content, context) {
    if (this.isBusy) {
      throw new Error('CLI Agent is busy');
    }
    
    this.isBusy = true;
    
    return new Promise((resolve, reject) => {
      const { command, args = [], cwd, env } = this.config;
      
      // Determine how to pass content:
      // Default: Append as argument (good for one-shot commands like 'echo' or 'claude -p')
      // If args is empty, maybe write to stdin?
      // Let's assume append for now as per previous logic.
      const finalArgs = [...args, content];
      
      console.log(`[CliAdaptor] Spawning: ${command} ${finalArgs.join(' ')} (cwd: ${cwd || 'default'})`);
      
      const child = spawn(command, finalArgs, {
        cwd: cwd || process.cwd(),
        env: { ...process.env, ...env },
        shell: true // Use shell for better compatibility
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        this.isBusy = false;
        if (code === 0) {
          resolve(stdoutData.trim()); 
        } else {
          // If stdout has data, maybe it's not a fatal error?
          if (stdoutData) {
              console.warn(`[CliAdaptor] Exited with code ${code} but returned data.`);
              resolve(stdoutData.trim() + `\n(Exit Code: ${code})`);
          } else {
              reject(new Error(`CLI exited with code ${code}\nSTDERR: ${stderrData}`));
          }
        }
      });

      child.on('error', (err) => {
        this.isBusy = false;
        reject(err);
      });
      
      // Timeout safety (30s)
      setTimeout(() => {
          if (this.isBusy) {
              child.kill();
              this.isBusy = false;
              reject(new Error('CLI Timeout (30s)'));
          }
      }, 30000);
    });
  }

  async checkStatus() {
    return this.isBusy ? 'busy' : 'online';
  }
}

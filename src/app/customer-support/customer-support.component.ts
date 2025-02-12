import { Component, OnInit } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';
import { environment } from 'src/environments/environment';
import { gptModels } from '../models/constants';
import { ChatWithBot, ResponseModel } from '../models/gpt-response';

@Component({
  selector: 'app-customer-support',
  templateUrl: './customer-support.component.html',
  styleUrls: ['./customer-support.component.css']
})
export class CustomerSupportComponent implements OnInit {
  chatConversation: ChatWithBot[] = [];
  response!: ResponseModel | undefined;
  gptModels = gptModels;
  promptText = '';
  showSpinner = false;

  // Propiedades para manejar archivos seleccionados
  selectedFile: File | null = null;
  selectedAudio: File | null = null;

  constructor() {}

  ngOnInit(): void {}

  // Método para manejar el envío del mensaje
  checkResponse() {
    this.pushChatContent(this.promptText, 'You', 'person');
    this.invokeGPT();
  }

  // Método para agregar contenido al chat
  pushChatContent(content: string, person: string, cssClass: string) {
    const chatToPush: ChatWithBot = { person: person, response: content, cssClass: cssClass };
    this.chatConversation.push(chatToPush);
  }

  // Método para dividir el texto en líneas
  getText(data: string) {
    return data.split('\n').filter((f) => f.length > 0);
  }

  // Método para manejar la selección de un archivo
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log('Archivo seleccionado:', this.selectedFile);

    if (this.selectedFile) {
      this.pushChatContent(`Archivo seleccionado: ${this.selectedFile.name}`, 'You', 'person');
      // Aquí puedes implementar la lógica para procesar el archivo (por ejemplo, enviarlo al servidor).
    }
  }

  // Método para manejar la selección de un archivo de audio
  onAudioSelected(event: any): void {
    this.selectedAudio = event.target.files[0];
    console.log('Audio seleccionado:', this.selectedAudio);

    if (this.selectedAudio) {
      this.pushChatContent(`Audio seleccionado: ${this.selectedAudio.name}`, 'You', 'person');
      // Aquí puedes implementar la lógica para procesar el archivo de audio.
    }
  }

  // Método para invocar la API de GPT
  async invokeGPT() {
    if (this.promptText.length < 2 && !this.selectedFile && !this.selectedAudio) {
      return;
    }

    try {
      this.response = undefined;
      let configuration = new Configuration({ apiKey: environment.apiKey });
      let openai = new OpenAIApi(configuration);

      let requestData = {
        model: 'text-davinci-003', // Modelo de GPT
        prompt: this.promptText, // Puedes modificar esto para incluir información del archivo si es necesario
        temperature: 0.95,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };

      this.showSpinner = true;

      // Llamada a la API de OpenAI
      let apiResponse = await openai.createCompletion(requestData);
      this.response = apiResponse.data as ResponseModel;

      // Agregar la respuesta del bot al chat
      this.pushChatContent(this.response.choices[0].text.trim(), 'Mr Roboto', 'bot');

      this.showSpinner = false;
    } catch (error: any) {
      this.showSpinner = false;
      // Manejo de errores
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }
  }
}

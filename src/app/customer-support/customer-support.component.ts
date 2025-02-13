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
    if (this.promptText.trim().length === 0) return;
    this.pushChatContent(this.promptText, 'You', 'person');
    this.invokeGPT();
    this.promptText = '';
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
onFileSelected(event: any): void {const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    // Leer el contenido del archivo como texto
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      console.log('Contenido del archivo:', fileContent);

      // Agregar el nombre del archivo y su contenido al chat
      this.pushChatContent(`Archivo seleccionado: ${file.name}`, 'You', 'person');
      this.pushChatContent(`Contenido del archivo: ${fileContent}`, 'You', 'person');

    };
    reader.readAsText(file);
  }
}

// Método para manejar la selección de un archivo de audio
onAudioSelected(event: any): void {
  const audioFile: File = event.target.files[0];
  if (audioFile) {
    this.selectedAudio = audioFile;

    // Leer el contenido del archivo de audio como base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const audioContent = e.target.result;
      console.log('Contenido del archivo de audio:', audioContent);

      // Agregar el nombre del archivo de audio al chat
      this.pushChatContent(`Audio seleccionado: ${audioFile.name}`, 'You', 'person');

      // Opcional: Procesar el archivo de audio (por ejemplo, enviarlo a una API)
    };
    reader.readAsDataURL(audioFile);
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
        model: 'text-davinci-003',
        prompt: this.promptText,
        temperature: 0.95,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };
      this.showSpinner = true;
      let apiResponse = await openai.createCompletion(requestData);
      this.response = apiResponse.data as ResponseModel;
      this.pushChatContent(this.response.choices[0].text.trim(), 'Mr Roboto', 'bot');
      this.showSpinner = false;
    } catch (error: any) {
      this.showSpinner = false;
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }
  }

  // Método para manejar la tecla Enter
  handleEnterKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.checkResponse();
  }
}

import {Component, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import { LocalStorageService } from './services/local-storage.service'
import { Subscription, tap } from 'rxjs';
import { ConnectionService, ConnectionState } from 'ng-connection-service';
import { ToasterService } from './toast/toaster.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  	title = 'offline-form';
	@ViewChild('fileInput') fileInput!: ElementRef;
	form: FormGroup;
	imagePreview: any;
	audioBlob: Blob | undefined;
	audioUrl: any;
	audioBase64: any; // audio as base64
	mediaRecorder: MediaRecorder | undefined;
	audioChunks: any[] = [];
	isRecording: boolean = false; // Track recording state
	audio: HTMLAudioElement | undefined;
	isPlaying: boolean = false;
	isConnected: ConnectionState | undefined;
	subscription = new Subscription();
	status!: string; // Track connction state

	constructor(
		private storage: LocalStorageService,
		private domSanitizer: DomSanitizer,
		private fb: FormBuilder,
		private connectionService:ConnectionService,
		private toaster: ToasterService
	) {
		this.form = this.fb.group({
			textInput: ['', [Validators.required, Validators.maxLength(200)]],
			imageInput: [null, Validators.required],
			voiceInput: [null, Validators.required],
		});
	}
	ngOnInit() {}

	sanitize(url: string) {
		return this.domSanitizer.bypassSecurityTrustUrl(url);
	}

	startRecording() {
		navigator.mediaDevices
		  .getUserMedia({ audio: true })
		  .then((stream) => {
			this.mediaRecorder = new MediaRecorder(stream);
			this.mediaRecorder.start();
			this.isRecording = true;
			this.mediaRecorder.addEventListener('dataavailable', (event) => {
			  	this.audioChunks.push(event.data);
			});
	
			this.mediaRecorder.addEventListener('stop', async () => {
				const mimeType = this.mediaRecorder?.mimeType;
				this.audioBlob = new Blob(this.audioChunks, { type: mimeType });

				let reader = new FileReader();
				reader.readAsDataURL(this.audioBlob);
				let that = this;
				reader.onloadend = function () {
					let base64String = reader.result;
					that.audioBase64 = base64String;
					that.form.patchValue({ voiceInput: that.audioBase64 });
				}

				this.audioChunks = [];
				this.isRecording = false;
		  		this.processRecording(this.audioBlob);

			});
		  })
		  .catch((error) => {
				console.error('Error accessing media devices.', error);
		  });
	}
	
	stopRecording() {
		if (this.mediaRecorder && this.isRecording) {
		  	this.mediaRecorder.stop();
		} else {
		  console.warn('MediaRecorder is not initialized or not recording.');
		}
	}

	deleteRecording() {
		if (this.audio) {
		  this.audio.pause();
		  this.audio = undefined;
		}
		this.audioBlob = undefined;
		this.audioUrl = null;
		this.isPlaying = false;
		this.form.patchValue({ voiceInput: null });
	}

	async onSubmit() {
		if (this.form.valid) {
			try {
				await this.storage.saveFormData(this.form.value);
				this.toaster.show('success', 'Form submitted successfully!', '', 2000);
				this.checkNetworkStatus();
				this.form.reset();
				this.imagePreview = null;
				if (this.fileInput) {
					this.fileInput.nativeElement.value = '';
				}
				this.audioUrl = null;
			} catch (error) {
				this.toaster.show('error', 'Error submitting form. Please try again.', '', 2000);
			}
		} else {
			this.toaster.show('warning', 'Please fill out all required fields.', '', 2000);
		}
	}

	/**
   	* processRecording Do what ever you want with blob
   	*/
	processRecording(blob: any) {
		this.audioUrl = URL.createObjectURL(blob);
	}

	onImageSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
		  const file = input.files[0];
		  if (file && file.type.match('image.*')) {
			const reader = new FileReader();
			reader.onload = () => {
			  this.imagePreview = reader.result;
			  this.form.patchValue({ imageInput: reader.result });
			};
			reader.readAsDataURL(file);
		  }
		}
	}

	async checkNetworkStatus() {
		this.subscription.add(
			this.connectionService.monitor().pipe(
				tap((newState: ConnectionState) => {
				this.isConnected = newState;
		
				if (this.isConnected.hasNetworkConnection) {
				  	this.status = 'ONLINE';
					this.storage.syncWithServer();
				} else {
				  	this.status = 'OFFLINE';
					this.storage.syncWithServer();
				}
				})
			).subscribe()
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}

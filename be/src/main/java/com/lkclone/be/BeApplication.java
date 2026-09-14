package com.lkclone.be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

// @EnableAsync: usado pelo GeoIpService pra buscar o país do visitante sem
// atrasar a resposta da página pública (a busca roda depois, em background).
@EnableAsync
@SpringBootApplication
public class BeApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeApplication.class, args);
	}

}

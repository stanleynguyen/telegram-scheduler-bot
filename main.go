package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-bongo/bongo"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api"
	"github.com/joho/godotenv"
)

func main() {
	if os.Getenv("GO_ENV") != "production" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal(err)
		}
	}

	mgoConfig := &bongo.Config{
		ConnectionString: os.Getenv("DB"),
	}
	bongo.Connect(mgoConfig)

	bot, err := tgbotapi.NewBotAPI(os.Getenv("BOT_TOKEN"))
	if err != nil {
		log.Fatal(err)
	}

	bot.Debug = true

	log.Printf("Authorized on account %s", bot.Self.UserName)

	_, err = bot.SetWebhook(tgbotapi.NewWebhook(os.Getenv("WEBHOOK_URL")))
	if err != nil {
		log.Fatal(err)
	}

	updates := bot.ListenForWebhook("/")
	go func(updates tgbotapi.UpdatesChannel) {
		for update := range updates {
			log.Printf("%+v\n", update.Message.Text)
		}
	}(updates)

	http.ListenAndServe(":8080", nil)
}

from handlers import base
from handlers import signup
from handlers import login
from handlers import pass_recovery
from handlers import pass_reset
from handlers import logout
from handlers import about
from handlers import library
from handlers.text import text
from handlers.text import text_analytics
from handlers.text import text_data
from handlers.text import text_mining
from handlers.text.word import word_context
from handlers import vocabulary


urls = [
    (r"/", base.BaseRequestHandler),
    (r"/about", about.AboutHandler),
    (r"/signup", signup.SignupHandler),
    (r"/login", login.LoginHandler),
    (r"/logout", logout.LogoutHandler),
    (r"/password/recovery", pass_recovery.PasswordRecoveryHandler),
    (r"/password/reset", pass_reset.PasswordResetHandler),
    (r"/library", library.LibraryHandler),
    (r"/library/text/(?P<tuid>[^/]*)?", text.TextHandler),
    (r"/library/text/analytics/(?P<tuid>[^/]*)",
     text_analytics.TextAnalyticsHandler),
    (r"/library/text/data/(?P<tuid>[^/]*)", text_data.TextDataHandler),
    (r"/library/text/mining/(?P<tuid>[^/]*)", text_mining.TextMiningHandler),
    (r"/library/text/(?P<tuid>[^/]*)/word/context/(?P<word>.*)",
     word_context.TextWordContextHandler),
    (r"/vocabulary", vocabulary.VocabularyHandler),
]

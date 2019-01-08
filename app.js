var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var s1Router = require("./routes/s1");
var s1GFRouter = require("./routes/s1_gf");

// inicio declaraciones
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var ciudadesRouter = require("./routes/ciudades");
var entidadesRouter = require("./routes/entidades");
var estadoscivilesRouter = require("./routes/estadosciviles");
var regimenmatrimonialRouter = require("./routes/regimenmatrimonial");
var municipiosRouter = require("./routes/municipios");
var localidadesRouter = require("./routes/localidades");
var tipovialidadRouter = require("./routes/tipovialidad");
var declaracionesRouter = require("./routes/declaraciones");
var docuemntosObtenidosRouter = require("./routes/documentosObtenidos");
var estatusEstudioRouter = require("./routes/estatusEstudio");
var nivelGobiernoRouter = require("./routes/nivelGobierno");
var poderEjecutivoRouter = require("./routes/poderEjecutivo");
var sectorIndustriaRouter = require("./routes/sectorIndustria");
//fin declaraciones

// catalogos
var catAmbitosRouter = require("./routes/catAmbitos");
var catBienesIntangiblesRouter = require("./routes/catBienesIntangibles");
var catCiudadesRouter = require("./routes/catCiudades");
var catDependenciasRouter = require("./routes/catDependencias");
var catDependientesEconomicosRouter = require("./routes/catDependientesEconomicos");
var catDocumentosObtenidosRouter = require("./routes/catDocumentosObtenidos");
var catEntidadesFederativasRouter = require("./routes/catEntidadesFederativas");
var catEstadosCivilesRouter = require("./routes/catEstadosCiviles");
var catEstadosEstudiosRouter = require("./routes/catEstadosEstudios");
var catFormaAdquisionRouter = require("./routes/catFormaAdquision");
var catFuncionesRouter = require("./routes/catFunciones");
var catGradosEstudioRouter = require("./routes/catGradosEstudio");
var catLocalicadesRouter = require("./routes/catLocalicades");
var catMarcasVehiculosRouter = require("./routes/catMarcasVehiculos");
var catMedidasPlazosRouter = require("./routes/catMedidasPlazos");
var catMunicipiosRouter = require("./routes/catMunicipios");
var catNaturalezaMembresiasRouter = require("./routes/catNaturalezaMembresias");
var catNivelesEncargoRouter = require("./routes/catNivelesEncargo");
var catNivelesGobiernoRouter = require("./routes/catNivelesGobierno");
var catPoderesJuridicosRouter = require("./routes/catPoderesJuridicos");
var catRegimenMatrimonialRouter = require("./routes/catRegimenMatrimonial");
var catRelacionDeclaranteRouter = require("./routes/catRelacionDeclarante");
var catSectoresIndustriasRouter = require("./routes/catSectoresIndustrias");
var catTiposAcredoresRouter = require("./routes/catTiposAcredores");
var catTiposActividadesRouter = require("./routes/catTiposActividades");
var catTiposAdeudosRouter = require("./routes/catTiposAdeudos");
var catTiposApoyosRouter = require("./routes/catTiposApoyos");
var catTiposBeneficiosRouter = require("./routes/catTiposBeneficios");
var catTiposBienesRouter = require("./routes/catTiposBienes");
var catTiposBienesInmueblesRouter = require("./routes/catTiposBienesInmuebles");
var catTiposEspecificosInversionRouter = require("./routes/catTiposEspecificosInversion");
var catTiposFideicomisosRouter = require("./routes/catTiposFideicomisos");
var catTiposInversionesRouter = require("./routes/catTiposInversiones");
var catTiposMetalesRouter = require("./routes/catTiposMetales");
var catTiposMonedasRouter = require("./routes/catTiposMonedas");
var catTiposOperacionesRouter = require("./routes/catTiposOperaciones");
var catTiposRepresentacionesRouter = require("./routes/catTiposRepresentaciones");
var catTiposVialidadesRouter = require("./routes/catTiposVialidades");
var catTitularesBienesRouter = require("./routes/catTitularesBienes");

// catalogos

var app = express();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/s1", s1Router);
app.use("/api/v2/s1", s1GFRouter);

// inicio declaraciones
app.use("/users", usersRouter);
app.use("/ciudades", ciudadesRouter);
app.use("/entidades", entidadesRouter);
app.use("/estadosciviles", estadoscivilesRouter);
app.use("/regimenmatrimonial", regimenmatrimonialRouter);
app.use("/municipios", municipiosRouter);
app.use("/localidades", localidadesRouter);
app.use("/tipovialidad", tipovialidadRouter);
app.use("/documentosObtenidos", docuemntosObtenidosRouter);
app.use("/estatusEstudio", estatusEstudioRouter);
app.use("/declaraciones", declaracionesRouter);
app.use("/nivelGobierno", nivelGobiernoRouter);
app.use("/poderEjecutivo", poderEjecutivoRouter);
app.use("/sectorIndustria", sectorIndustriaRouter);
//fin declaraciones

// catalogos
app.use("/catAmbitos", catAmbitosRouter);
app.use("/catBienesIntangibles", catBienesIntangiblesRouter);
app.use("/catCiudades", catCiudadesRouter);
app.use("/catDependencias", catDependenciasRouter);
app.use("/catDependientesEconomicos", catDependientesEconomicosRouter);
app.use("/catDocumentosObtenidos", catDocumentosObtenidosRouter);
app.use("/catEntidadesFederativas", catEntidadesFederativasRouter);
app.use("/catEstadosCiviles", catEstadosCivilesRouter);
app.use("/catEstadosEstudios", catEstadosEstudiosRouter);
app.use("/catFormaAdquision", catFormaAdquisionRouter);
app.use("/catFunciones", catFuncionesRouter);
app.use("/catGradosEstudio", catGradosEstudioRouter);
app.use("/catLocalicades", catLocalicadesRouter);
app.use("/catMarcasVehiculos", catMarcasVehiculosRouter);
app.use("/catMedidasPlazos", catMedidasPlazosRouter);
app.use("/catMunicipios", catMunicipiosRouter);
app.use("/catNaturalezaMembresias", catNaturalezaMembresiasRouter);
app.use("/catNivelesEncargo", catNivelesEncargoRouter);
app.use("/catNivelesGobierno", catNivelesGobiernoRouter);
app.use("/catPoderesJuridicos", catPoderesJuridicosRouter);
app.use("/catRegimenMatrimonial", catRegimenMatrimonialRouter);
app.use("/catRelacionDeclarante", catRelacionDeclaranteRouter);
app.use("/catSectoresIndustrias", catSectoresIndustriasRouter);
app.use("/catTiposAcredores", catTiposAcredoresRouter);
app.use("/catTiposActividades", catTiposActividadesRouter);
app.use("/catTiposAdeudos", catTiposAdeudosRouter);
app.use("/catTiposApoyos", catTiposApoyosRouter);
app.use("/catTiposBeneficios", catTiposBeneficiosRouter);
app.use("/catTiposBienes", catTiposBienesRouter);
app.use("/catTiposBienesInmuebles", catTiposBienesInmueblesRouter);
app.use("/catTiposEspecificosInversion", catTiposEspecificosInversionRouter);
app.use("/catTiposFideicomisos", catTiposFideicomisosRouter);
app.use("/catTiposInversiones", catTiposInversionesRouter);
app.use("/catTiposMetales", catTiposMetalesRouter);
app.use("/catTiposMonedas", catTiposMonedasRouter);
app.use("/catTiposOperaciones", catTiposOperacionesRouter);
app.use("/catTiposRepresentaciones", catTiposRepresentacionesRouter);
app.use("/catTiposVialidades", catTiposVialidadesRouter);
app.use("/catTitularesBienes", catTitularesBienesRouter);
// catalogos

module.exports = app;

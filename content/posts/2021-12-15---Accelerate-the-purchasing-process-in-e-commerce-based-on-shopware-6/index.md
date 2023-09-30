---
title: Accelerate the purchasing 🛍 process in e-commerce based on Shopware 6
date: "2021-12-15T22:40:32.169Z"
template: "post"
draft: false
slug: "/blog/accelerate-the-purchasing-process-in-e-commerce-based-on-shopware-6"
category: "E-commerce"
tags:
  - "Shopware 6"
  - "E-commerce"
description: "For over 3 years I have been creating and developing e-commerce businesses using the Shopware engine. The company I work for has developed dozens of large online stores that serve many customers. A big problem in this industry is a phenomenon called shopping cart abandonment."
socialImage: "./media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

For over 3 years I have been creating and developing e-commerce businesses using the [Shopware](https://www.shopware.com/) engine. The company I work for has developed dozens of large online stores that serve many customers.

A big problem in this industry is a phenomenon called _"shopping cart abandonment"_.

> "Abandonment is an ecommerce term used to describe a visitor on a web page who leaves that page before completing the desired action. Examples of abandonment include shopping cart abandonment, referring to visitors who add items to their online shopping cart, but exit without completing the purchase." - Webopedia

While there are ways to recover an abandoned carts, **prevention is better than cure** in my opinion. One of the best solutions to this problem is to simplify and streamline the purchasing process.

In this article, I would like to present my solution to accelerate the purchasing process for B2B customers in Shopware 6 using an integration plugin.

---

# Integration plugin

## Description

European VAT Reg.No. Validation integration plugin for Shopware 6.

- **Checks if the VAT Reg.No. entered is according to the correct format**\
  ❗️ _does not allow to generate an invoice with incorrect data_

- **Automatically enters data into the company name and address fields from the VIES**\
  🏎 _speeds up the purchasing process by filling in the fields with available company data from VIES_

- **Allows you to set the required field for vat number**\
  ✅ _adds a missing configuration option that is missing in the base version of Shopware 6_

## Preview

![alt](/media/preview.gif)

## License

The MIT License (MIT). Please see [License File](https://github.com/pietrzakadrian/PluginVatValidation/blob/production/LICENSE) for more information.

---

# Software architecture

This section shows the directory and file structure that was created to produce this software.\
The integration plugin does quite a few things:

- Allows plugin configuration,
- Creates a new JavaScript plugin that allows you to communicate with the backend controller,
- Extends an existing JavaScript plugin,
- Uses an external NPM package,
- Customizes SCSS code,
- Creates a new backend controller that sends a request to an external service using SOAP,
- Validates the received data from the controller and processes it,
- Supports 3 languages: English, German and Polish,
- Includes unit tests. 👀

The source code file structure looks like this:

```
.
├── bin
│   └── phpunit.sh
├── node_modules
│   ├── jsvat
│   └── .yarn-integrity
├── src
│   ├── Controller
│   │   └── CheckVatController.php
│   ├── Dto
│   │   ├── TraderDataRequestDto.php
│   │   └── TraderDataResponseDto.php
│   ├── Exception
│   │   ├── CompanyNoInformationException.php
│   │   ├── CompanyNotValidException.php
│   │   └── ConnectErrorException.php
│   ├── Resources
│   │   ├── app
│   │   │   └── storefront
│   │   │       ├── build
│   │   │       │   └── webpack.config.js
│   │   │       ├── dist
│   │   │       │   └── storefront
│   │   │       │       └── js
│   │   │       │           └── plugin-vat-validation.js
│   │   │       └── src
│   │   │           ├── plugin
│   │   │           │   ├── helper
│   │   │           │   │   └── typography.helper.js
│   │   │           │   ├── form-vat-validation.plugin.js
│   │   │           │   └── vat-validation-loader-data.plugin.js
│   │   │           ├── scss
│   │   │           │   └── base.scss
│   │   │           └── main.js
│   │   ├── config
│   │   │   ├── config.xml
│   │   │   ├── routes.xml
│   │   │   └── services.xml
│   │   ├── snippet
│   │   │   ├── de_DE
│   │   │   │   └── pluginVatValidation.de-DE.json
│   │   │   ├── pl_PL
│   │   │   │   └── pluginVatValidation.pl-PL.json
│   │   │   └── en_GB
│   │   │       └── pluginVatValidation.en-GB.json
│   │   └──  views
│   │        └── storefront
│   │            └── component
│   │                └── address
│   │                    └── address-personal-vat-id.html.twig
│   ├── Response
│   │   └── VatValidationResponse.php
│   ├── Service
│   │   ├── CheckVatService.php
│   │   ├── CheckVatServiceInterface.php
│   │   ├── Client.php
│   │   ├── ClientInterface.php
│   │   ├── TraderDataValidator.php
│   │   └── TraderDataValidatorInterface.php
│   ├── Struct
│   │   └── TraderStruct.php
│   └── PluginVatValidation.php
├── tests
│   ├── Controller
│   │   └── CheckVatControllerTest.php
│   ├── Dto
│   │   ├── TraderDataRequestDtoTest.php
│   │   └── TraderDataResponseDtoTest.php
│   ├── Exception
│   │   ├── CompanyNoInformationExceptionTest.php
│   │   ├── CompanyNotValidExceptionTest.php
│   │   └── ConnectErrorExceptionTest.php
│   ├── Response
│   │   └── VatValidationResponseTest.php
│   ├── Service
│   │   └── TraderDataValidatorTest.php
│   ├── Struct
│   │   └── TraderStructTest.php
│   └── TestBootstrap.php
├── .gitignore
├── CHANGELOG.md
├── CHANGELOG_de-DE.md
├── LICENSE
├── README.md
├── composer.json
├── composer.lock
├── package.json
├── phpunit.xml.dist
└── yarn.lock
```

---

# BPMN Diagram

This software performs a specific action process in your ecommerce business. The integration plugin workflow diagram is presented below.

![Diagram](/media/diagram.png)

---

# Source code

The plugin does many things, but in order not to describe everything, only the most important source code files are presented.

## 1. FormVatValidationPlugin

First, the base [form-validation.plugin.js](https://github.com/shopware/platform/blob/trunk/src/Storefront/Resources/app/storefront/src/plugin/forms/form-validation.plugin.js) was modified. Added validator for VAT number when field has attribute **data-form-validation-vat-valid**. It uses the external npm package [jsvat](https://www.npmjs.com/package/jsvat) for this.

```js
import FormValidation from "src/plugin/forms/form-validation.plugin";
import { checkVAT, countries } from "jsvat";

export default class FormVatValidationPlugin extends FormValidation {
  static options = {
    stylingEnabled: true,
    styleCls: "was-validated",
    hintCls: "invalid-feedback",
    debounceTime: "150",
    eventName: "ValidateEqual",
    equalAttr: "data-form-validation-equal",
    lengthAttr: "data-form-validation-length",
    lengthTextAttr: "data-form-validation-length-text",
    vatAttr: "data-form-validation-vat-valid",
  };

  _registerEvents() {
    super._registerEvents();

    this._registerValidationListener(
      this.options.vatAttr,
      this._onValidateVat.bind(this),
      ["change"]
    );
  }

  _onValidateVat(event) {
    const field = event.target;
    const value = field.value.trim();
    const { isValid } = checkVAT(value, countries);

    if (value && !isValid) {
      this._setFieldToInvalid(field, this.options.vatAttr);
    } else {
      this._setFieldToValid(field, this.options.vatAttr);
    }

    this.$emitter.publish("onValidateVat");
  }
}
```

## 2. VatValidationLoaderDataPlugin

The next step was to create a JavaScript plugin to handle entering vat number into the field. This plugin checks if user has entered vat number in correct format. If so, it sends a query to the controller. It then receives that data, parses it and fills in the fields in the form.

```js
import Plugin from "src/plugin-system/plugin.class";
import StoreApiClient from "src/service/store-api-client.service";
import ElementLoadingIndicatorUtil from "src/utility/loading-indicator/element-loading-indicator.util";
import { checkVAT, countries } from "jsvat";
import { titleCase } from "./helper/typography.helper";

export default class VatValidationLoaderDataPlugin extends Plugin {
  static options = {
    companyVatIdSelector: "#vatIds",
    companyNameSelector: "#billingAddresscompany",
    companyAddressSelector: "#billingAddressAddressStreet",
    companyZipcodeSelector: "#billingAddressAddressZipcode",
    companyCitySelector: "#billingAddressAddressCity",
    companyCountrySelector: "#billingAddressAddressCountry",
  };

  init() {
    this._client = new StoreApiClient();
    this.$companyVatId = this.el.querySelector(
      this.options.companyVatIdSelector
    );
    this.$companyName = this.el.querySelector(this.options.companyNameSelector);
    this.$companyAddress = this.el.querySelector(
      this.options.companyAddressSelector
    );
    this.$companyZipcode = this.el.querySelector(
      this.options.companyZipcodeSelector
    );
    this.$companyCity = this.el.querySelector(this.options.companyCitySelector);
    this.$companyCountry = this.el.querySelector(
      this.options.companyCountrySelector
    );

    this._registerEvents();
  }

  _registerEvents() {
    this.$companyVatId.addEventListener("change", this._onChange.bind(this));
  }

  _onChange(event) {
    const field = event.target;
    const value = field.value.trim();
    const { isValid, country } = checkVAT(value, countries);

    if (isValid) {
      this._resetAllCompanyRegistrationValues();
      this._fetchData(value);
      this._setSelectOption(this.$companyCountry, country.name);
    }
  }

  _fetchData(vatId) {
    ElementLoadingIndicatorUtil.create(this.$companyVatId.parentNode);

    this._client.get(`store-api/company/${vatId}`, this._handleData.bind(this));
  }

  _handleData(response, request) {
    ElementLoadingIndicatorUtil.remove(this.$companyVatId.parentNode);

    if (request.status >= 400) {
      throw new Error(`Failed to parse vat validation info from VIES response`);
    }

    this._parseData(response);
  }

  _parseData(response) {
    const { traderName, traderAddress } = JSON.parse(response);
    const formattedTraderAddress = traderAddress.replace("\n", ", ");
    const [, address, zipCode, city] = formattedTraderAddress.match(
      /^([^,]+), (\S+) ([^,]+)$/
    );

    this._setInputValue(this.$companyName, traderName);
    this._setInputValue(this.$companyAddress, address, true);
    this._setInputValue(this.$companyZipcode, zipCode);
    this._setInputValue(this.$companyCity, city, true);
  }

  _resetAllCompanyRegistrationValues() {
    const elements = [
      this.$companyName,
      this.$companyAddress,
      this.$companyZipcode,
      this.$companyCity,
      this.$companyCountry,
    ];

    elements.forEach((element) => {
      switch (element.tagName) {
        case "INPUT": {
          this._resetInputValue(element);
          break;
        }

        case "SELECT": {
          this._resetSelectOption(element);
          break;
        }
      }
    });
  }

  _setSelectOption(element, text) {
    for (let i = 0; i < element.options.length; ++i) {
      if (element.options[i].text === text) {
        element.options[i].selected = true;
      }
    }
  }

  _setInputValue(element, value, isTitleCase = false) {
    element.value = isTitleCase ? titleCase(value) : value;
  }

  _resetSelectOption(element) {
    element.options[0].selected = true;
  }

  _resetInputValue(element) {
    element.value = "";
  }
}
```

## 3. CheckVatController

The third step was to program the Store API Controller, which received data from the frontend layer and passed it to the external VIES service. The OpenAPI documentation was also completed at this point.

```php
<?php declare(strict_types=1);

namespace Plugin\VatValidation\Controller;

use OpenApi\Annotations as OA;
use Plugin\VatValidation\Response\VatValidationResponse;
use Plugin\VatValidation\Service\CheckVatInterface;
use Plugin\VatValidation\Service\CheckVatServiceInterface;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @RouteScope(scopes={"store-api"})
 */
class CheckVatController extends AbstractController
{
    private CheckVatServiceInterface $checkVatService;

    public function __construct(CheckVatServiceInterface $checkVatService)
    {
        $this->checkVatService = $checkVatService;
    }

    /**
     * @OA\Get(
     *     path="/company/{vatId}",
     *     description="Loads the trader details of the given Company VAT ID",
     *     operationId="readCompanyData",
     *     tags={"Store API", "Company"},
     *     @OA\Parameter(
     *         parameter="vatId",
     *         name="vatId",
     *         in="path",
     *         description="VAT ID of the Company",
     *         @OA\Schema(type="string"),
     *         required=true
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Details of the Company Data",
     *         @OA\JsonContent(
     *              @OA\Property(
     *                  property="apiAlias",
     *                  type="string",
     *                  example="plugin_vat_validation_struct_trader_struct",
     *                  description="Api alias"
     *              ),
     *              @OA\Property(
     *                  property="traderName",
     *                  type="string",
     *                  example="COMPANY GmbH",
     *                  description="Company name"
     *              ),
     *              @OA\Property(
     *                  property="traderAddress",
     *                  type="string",
     *                  example="POZNAŃSKA 3D, 67-200 GŁOGÓW",
     *                  description="Company address"
     *              )
     *         )
     *     )
     * )
     * @Route("/store-api/company/{vatId}", name="store-api.vat-validation", options={"seo"="false"}, methods={"GET"})
     */
    public function checkVat(string $vatId): VatValidationResponse
    {
        return new VatValidationResponse($this->checkVatService->handleTraderData($vatId));
    }
}
```

## 4. CheckVatService

This is where all the business logic was programmed. The service is responsible for reading the data from the controller, sends it to the VIES Client, handles the payload and sends it back to the controller.

```php
<?php declare(strict_types=1);

namespace Plugin\VatValidation\Service;

use Plugin\VatValidation\Dto\TraderDataRequestDto;
use Plugin\VatValidation\Dto\TraderDataResponseDto;
use Plugin\VatValidation\Exception\CompanyNoInformationException;
use Plugin\VatValidation\Exception\CompanyNotValidException;
use Plugin\VatValidation\Struct\TraderStruct;

class CheckVatService implements CheckVatServiceInterface
{
    private TraderDataRequestDto $traderDataRequestDto;

    private TraderDataValidatorInterface $traderDataValidator;

    private TraderStruct $traderStruct;

    private ClientInterface $client;

    public function __construct(ClientInterface $client, TraderDataValidatorInterface $traderDataValidator)
    {
        $this->client = $client;
        $this->traderDataValidator = $traderDataValidator;
        $this->traderDataRequestDto = new TraderDataRequestDto();
        $this->traderStruct = new TraderStruct();
    }

    public function handleTraderData(string $requestVatId): TraderStruct
    {
        $traderData = $this->fetchTraderData($requestVatId);
        $this->validateTraderData($traderData);

        return $this->saveTraderData($traderData);
    }

    private function fetchTraderData(string $requestedVatId): TraderDataResponseDto
    {
        $vatId = str_replace(array(' ', '.', '-', ',', ', '), '', trim($requestedVatId));
        $countryCode = substr($vatId, 0, 2);
        $vatNumber = substr($vatId, 2);

        $this->traderDataRequestDto->setCountryCode($countryCode);
        $this->traderDataRequestDto->setVatNumber($vatNumber);

        return $this->client->check($this->traderDataRequestDto);
    }

    private function saveTraderData(TraderDataResponseDto $traderDataResponseDto): TraderStruct
    {
        $this->traderStruct->setTraderName($traderDataResponseDto->getName());
        $this->traderStruct->setTraderAddress($traderDataResponseDto->getAddress());

        return $this->traderStruct;
    }

    private function validateTraderData(TraderDataResponseDto $traderDataResponseDto): void {
        if (!$this->traderDataValidator->isCompanyAddressValid($traderDataResponseDto->getAddress())) {
            throw new CompanyNoInformationException();
        }

        if (!$this->traderDataValidator->isCompanyNameValid($traderDataResponseDto->getName())) {
            throw new CompanyNoInformationException();
        }

        if (!$this->traderDataValidator->isCompanyValid($traderDataResponseDto->isValid())) {
            throw new CompanyNotValidException();
        }
    }
}

```

## 5. Client

The final step was to program the Client, which will be responsible for sending the request to VIES using the SOAP protocol.

```php
<?php declare(strict_types=1);

namespace Plugin\VatValidation\Service;

use SoapClient;
use SoapFault;
use Plugin\VatValidation\Exception\ConnectErrorException;
use Plugin\VatValidation\Dto\TraderDataRequestDto;
use Plugin\VatValidation\Dto\TraderDataResponseDto;

class Client implements ClientInterface
{
    private const EC_URL = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

    private TraderDataResponseDto $traderDataResponseDto;

    public function __construct()
    {
        $this->traderDataResponseDto = new TraderDataResponseDto();
    }

    public function check(TraderDataRequestDto $traderDataRequestDto): TraderDataResponseDto
    {
        $client = new SoapClient(self::EC_URL);

        if (!$client) {
            throw new ConnectErrorException();
        }

        try {
            $loadedTrader = $client->checkVat($traderDataRequestDto);

            $this->traderDataResponseDto->setName($loadedTrader->name);
            $this->traderDataResponseDto->setAddress($loadedTrader->address);
            $this->traderDataResponseDto->setVatNumber($loadedTrader->vatNumber);
            $this->traderDataResponseDto->setRequestDate($loadedTrader->requestDate);
            $this->traderDataResponseDto->setValid($loadedTrader->valid);
            $this->traderDataResponseDto->setCountryCode($loadedTrader->countryCode);

            return $this->traderDataResponseDto;
        } catch (SoapFault $e) {
            throw new ConnectErrorException($e->getMessage());
        }
    }
}
```

This is how the integration plugin was programmed. 🤟\
The backend controller was written in PHP. For the frontend layer, JavaScript was used (as always).

> **Note**: A public repository is not available at the moment. Perhaps in the near future the plugin will be made available on the Shopware Store.

---

# Unit tests

A set of unit tests was executed using **PHPUnit** framework. All tests are located in the [tests](https://github.com/pietrzakadrian/PluginVatValidation/tree/production/tests) directory.
To run the unit tests, type the command `./bin/phpunit` in the plugin root directory:

```
❯ ./bin/phpunit.sh
PHPUnit 9.5.10 by Sebastian Bergmann and contributors.

Random Seed:   1639800703

Testing
......................                                            22 / 22 (100%)

Time: 00:01.495, Memory: 64.50 MB

OK (22 tests, 35 assertions)
```

---

# Frequently Asked Questions

## The VAT Reg.No. is not being recognized.

The VAT Reg.No. is verified live by contacting the VIES servers which are only available during 5:00 AM and 11:00 PM.

Please make sure that the company information data is entered in the online form exactly as it has been registered. You can check the exact registration information for your company via [this](https://ec.europa.eu/taxation_customs/vies/vatResponse.html?locale=en) link.

---

This article demonstrates how an integration plugin for the Shopware 6 platform works to streamline the shopping process. It explains what an "shopping cart abandonment" is and shows how to reduce this problem for B2B customers.

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

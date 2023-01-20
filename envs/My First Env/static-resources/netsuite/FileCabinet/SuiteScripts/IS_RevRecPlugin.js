/**
 * @NApiVersion 2.0
 * @NScriptType AdvancedRevRecPlugin
 */
define([
    "N/search",
    "N/record",
    "N/email",
    "N/runtime",
    "N/error",
    "N/format",
    "/SuiteScripts/IS_RevRecPlugin_Lib.js",
    "N/query"
], function (search, record, email, runtime, error, format, lib, query) {
    function getRevenueElementSourceIdsForCreation(context) {
        log.audit("getRevenueElementSourceIdsForCreation: Entry", context);

        var sourceIds = [];
        var sourceExternalIdsForCreation =
            lib.getSourceExternalIdsForRevenueElementCreation();
        for (
            var i = 0, len = sourceExternalIdsForCreation.length;
            i < len;
            i++
        ) {
            sourceIds.push(
                lib.getSourceIdFromSourceExternalId(
                    sourceExternalIdsForCreation[i]
                )
            );
        }
        context.output.ids = sourceIds;

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );

        log.audit("getRevenueElementSourceIdsForCreation: Exit", context);
    }

    function getRevenueElementsForSourceId(context) {
        log.audit("getRevenueElementsForSourceId: Entry", context);

        var revenueElements = [];
        var custSourceRecord = record.load({
            type: lib.getSourceRecordType(),
            id: context.input.id
        });

        if (custSourceRecord != null) {
            var externalId = custSourceRecord.getValue(
                "custrecord_is_cl_source_ext_id"
            );

            revenueElements.push(
                context.output.createRevenueElement({
                    sourceId: context.input.id,
                    accountingBook: lib.getAccountingBook(externalId),
                    subsidiary: lib.getSubsidiary(externalId),
                    currency: lib.getCurrency(externalId),
                    item: lib.getItem(externalId),
                    quantity: lib.getQuantity(externalId),
                    salesAmount:
                        lib.getPrice(externalId) * lib.getQuantity(externalId),
                    discountedSalesAmount:
                        lib.getPrice(externalId) * lib.getQuantity(externalId),
                    elementDate: lib.getDate(externalId),
                    entity: lib.getCustomer(externalId),
                    endUser: lib.getEndUser(externalId),
                    startDate: lib.getRevRecStartDate(externalId),
                    endDate: lib.getRevRecEndDate(externalId),
                    forecaststartdate: lib.getRevRecStartDate(externalId),
                    forecastendDate: lib.getRevRecEndDate(externalId),
                    location: lib.getLocation(externalId),
                    department: lib.getDepartment(externalId),
                    //alternateQuantity: null,
                    //alternateUnits: null,
                    //alternateUnitsType: null,
                    //sourceType: null,
                    exchangeRate: lib.getExchangeRate(externalId),
                    sfDealId: lib.getSFdealId(externalId),
                    classification: lib.getClassification(externalId)
                })
            );
        }

        context.output.revenueElements = revenueElements;

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );

        log.audit("getRevenueElementsForSourceId: Exit", context);
    }

    function getRevenueArrangementGroupForSourceId(context) {
        log.audit("getRevenueArrangementGroupForSourceId: Entry", context);

        try {
            var custSourceRecord = record.load({
                type: lib.getSourceRecordType(),
                id: context.input.id
                //id: 516
            });
            var orderId = custSourceRecord.getValue({
                fieldId: "custrecord_is_cl_order"
            });
            // var externalId = custSourceRecord.getValue(
            //     "custrecord_is_cl_source_ext_id"
            // );
            // log.debug("rev arrangement externalId", externalId);
            // context.output.id = lib.getArrangementKey(externalId);
            //context.output.id = '105407';
            log.debug("rev arrangement group order ID: ", orderId);
            context.output.id = orderId;

            var scriptObj = runtime.getCurrentScript();
            log.debug(
                "Remaining governance units: " + scriptObj.getRemainingUsage()
            );
        } catch (e) {
            log.error({
                title: "ERROR GETTING ARRANGEMENT GROUPING",
                details: e
            });
        }
        log.audit("getRevenueArrangementGroupForSourceId: Exit", context);

        var uncheckCreateNewElement = record.submitFields({
            type: "customrecord_contractlines",
            id: context.input.id,
            values: {
                custrecord_is_new_ext_id: false,
                custrecord_is_update_rev_element: false
            }
        });

        var newExtId = custSourceRecord.getValue("custrecord_is_new_ext_id");
        //log.debug('newExtId', newExtId)
    }

    function getSourceRecordType(context) {
        log.audit("getSourceRecordType: Entry", context);

        context.output.sourceRecordType = lib.getSourceRecordType();

        log.audit("getSourceRecordType: Exit", context);

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );
    }

    function onRevenueElementCreated(context) {
        log.audit("onRevenueElementCreated: Entry", context);

        var revenueElementID = context.input.revenueElement.revenueElementId;
        //log.debug('onreccreate', context)

        var setRevenueElement = record.submitFields({
            type: "customrecord_contractlines",
            id: context.input.revenueElement.sourceId,
            values: {
                custrecord_is_cl_revenue_element: revenueElementID
            }
        });

        lib.notifyRevenueElementCreated(context);

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );
    }

    function getRevenueElementSourceIdsForUpdate(context) {
        log.audit("getRevenueElementSourceIdsForUpdate: Entry", context);

        var sourceIds = [];
        var sourceExternalIdsForUpdate =
            lib.getSourceExternalIdsForRevenueElementUpdate();
        for (var i = 0, len = sourceExternalIdsForUpdate.length; i < len; i++) {
            sourceIds.push(
                lib.getSourceIdFromSourceExternalId(
                    sourceExternalIdsForUpdate[i]
                )
            );
        }
        context.output.ids = sourceIds;

        log.audit("getRevenueElementSourceIdsForUpdate: Exit", context);

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );
    }

    function updateRevenueElement(context) {
        log.audit("updateRevenueElement: Entry", context);

        var custSourceRecord = record.load({
            type: lib.getSourceRecordType(),
            id: context.output.revenueElement.sourceId
        });

        var externalId = custSourceRecord.getValue(
            "custrecord_is_cl_source_ext_id"
        );
        context.output.revenueElement.quantity = lib.getQuantity(externalId);
        //context.output.revenueElement.salesAmount = lib.getPrice(externalId)* lib.getQuantity(externalId);
        //context.output.revenueElement.discountedSalesAmount = lib.getPrice(externalId) * lib.getQuantity(externalId);
        context.output.revenueElement.salesAmount =
            lib.getTotalPrice(externalId);
        context.output.revenueElement.discountedSalesAmount =
            lib.getTotalPrice(externalId);
        context.output.revenueElement.item = lib.getItem(externalId);
        context.output.revenueElement.department =
            lib.getDepartment(externalId);
        context.output.revenueElement.classification =
            lib.getClassification(externalId);
        context.output.revenueElement.location = lib.getLocation(externalId);
        context.output.revenueElement.exchangeRate =
            lib.getExchangeRate(externalId);

        log.debug(
            "DH context.output.revenueElement.sourceId",
            context.output.revenueElement.sourceId
        );
        var uncheckUpdateRevElement = record.submitFields({
            type: "customrecord_contractlines",
            id: context.output.revenueElement.sourceId,
            values: {
                custrecord_is_update_rev_element: false
            }
        });

        log.audit("updateRevenueElement: Exit", context);

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );
    }

    function getInvoiceLinksForSourceId(context) {
        log.audit("getInvoiceLinksForSourceId: Entry", context);

        var invoiceLinks = [];

        // var custSourceRecord = record.load({
        //     type: lib.getSourceRecordType(),
        //     id: context.input.id
        // });

        log.debug("sourceId", context.input.id);

        if (context.input.id != null) {
            // var externalId = custSourceRecord.getValue(
            //     "custrecord_is_cl_source_ext_id"
            // );
            //        log.debug("externalId", externalId);

            // search for invoice lines related to provided source id
            var sql =
                "SELECT" +
                "  l.transaction," +
                "  l.donotcreaterevenueelement," +
                "  l.uniquekey as uniqueKey," +
                "  (l.foreignamount * -1) as fxamount," +
                "  t.exchangerate as exchangerate," +
                "  l.custcol_reference_contractline " +
                "FROM" +
                "  TransactionLine l" +
                "  INNER JOIN Transaction t ON t.id = l.transaction " +
                "WHERE" +
                "  l.custcol_reference_contractline = " +
                context.input.id +
                "  and l.mainline = 'F'" +
                "  and l.donotcreaterevenueelement = 'T'";

            // return mapped transaction line results
            const tranlineRes = query
                .runSuiteQL({ query: sql })
                .asMappedResults();
            log.debug("invoiceSearchResultCount", tranlineRes);

            tranlineRes.forEach(function (result) {
                invoiceLinks.push(
                    context.output.createSourceToInvoiceTransactionLink({
                        sourceId: context.input.id,
                        transactionLine: result.uniquekey,
                        fxAmount: result.fxamount,
                        baseAmount: result.fxamount * result.exchangerate
                    })
                );
            });
        }

        context.output.sourceToInvoiceTransactionLinks = invoiceLinks;

        log.audit("getInvoiceLinksForSourceId: Exit", context);

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );
    }

    function getInvoiceLinksForInvoiceId(context) {
        log.audit("getInvoiceLinksForInvoiceId: Entry", context);

        var invoiceLinks = [];

        // Construct the SuiteQL query string
        var sql =
            "SELECT" +
            "  l.transaction," +
            "  l.donotcreaterevenueelement," +
            "  l.uniquekey," +
            "  (l.foreignamount * -1) as fxamount," +
            "  t.exchangerate," +
            "  l.custcol_reference_contractline " +
            "FROM" +
            "  TransactionLine l" +
            "  INNER JOIN Transaction t ON t.id = l.transaction " +
            "WHERE" +
            "  t.id = " +
            context.input.id +
            "  and l.mainline = 'F'" +
            "  and l.donotcreaterevenueelement = 'T'";

        // Run the SuiteQL query as a paged query and return an iterator
        var resultIterator = query
            .runSuiteQLPaged({
                query: sql,
                pageSize: 1000
            })
            .iterator();

        // Use the iterator to process each page of results
        resultIterator.each(function (page) {
            var pageIterator = page.value.data.iterator();
            pageIterator.each(function (row) {
                log.debug(
                    "Do Not Create Revenue Element: " + row.value.getValue(1)
                );
                invoiceLinks.push(
                    context.output.createSourceToInvoiceTransactionLink({
                        sourceId: row.value.getValue(5),
                        transactionLine: row.value.getValue(2),
                        fxAmount: row.value.getValue(3),
                        baseAmount:
                            row.value.getValue(3) * row.value.getValue(4)
                    })
                );
                log.debug(
                    "getInvoiceLinksForInvoiceId",
                    invoiceLinks.slice(-1)[0]
                );
                return true;
            });

            return true;
        });

        /*
            var invoiceSearch = search.create({
                type: 'transaction',
                columns: [{name:'lineuniquekey'}, {name:'amount'}, {name:'custcol_arm_sourceexternalid'},{name: 'fxamount'},{name: 'exchangerate'},{name:'custcol_reference_contractline'}],
                filters: [{name:'internalid', operator: 'is', values:[context.input.id]},
                    {name:'item', operator: 'noneof', values:['@NONE@']},
                    {name:'shipping', operator: 'is', values:['F']},
                    {name:'taxline', operator: 'is', values:['F']},
                    {name:'donotcreaterevenueelement', operator: 'is', values:['F']}]
            });

            var invoiceSearchResultCount = invoiceSearch.runPaged().count;
            log.debug("invoiceSearchResultCount",invoiceSearchResultCount);

            invoiceSearch.run().each(function (invoiceResult) {

                invoiceLinks.push(context.output.createSourceToInvoiceTransactionLink({
                    sourceId: invoiceResult.getValue({name: 'custcol_reference_contractline'}),
                    transactionLine: invoiceResult.getValue({name: 'lineuniquekey'}),
                    fxAmount: invoiceResult.getValue({name: 'fxamount'}),
                    baseAmount: invoiceResult.getValue({name: 'fxamount'}) * invoiceResult.getValue({name:'exchangerate'})
                }));
                log.debug('getInvoiceLinksForInvoiceId', invoiceLinks.slice(-1)[0]);
                return true;
            });
*/
        context.output.sourceToInvoiceTransactionLinks = invoiceLinks;

        var scriptObj = runtime.getCurrentScript();
        log.debug(
            "Remaining governance units: " + scriptObj.getRemainingUsage()
        );

        log.audit("getInvoiceLinksForInvoiceId: Exit", context);
    }
    return {
        getRevenueElementSourceIdsForCreation:
        getRevenueElementSourceIdsForCreation,
        getRevenueElementsForSourceId: getRevenueElementsForSourceId,
        getRevenueArrangementGroupForSourceId:
        getRevenueArrangementGroupForSourceId,
        getSourceRecordType: getSourceRecordType,
        onRevenueElementCreated: onRevenueElementCreated,
        getRevenueElementSourceIdsForUpdate:
        getRevenueElementSourceIdsForUpdate,
        updateRevenueElement: updateRevenueElement,
        getInvoiceLinksForSourceId: getInvoiceLinksForSourceId,
        getInvoiceLinksForInvoiceId: getInvoiceLinksForInvoiceId
    };
});

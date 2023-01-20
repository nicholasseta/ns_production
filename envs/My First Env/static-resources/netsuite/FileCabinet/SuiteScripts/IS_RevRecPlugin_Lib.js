/**
 * Revenue Management Plug-in Library
 * @suiteScriptVersion 2.x
 */
define(['N/search', 'N/record', 'N/runtime'],
    function (search, record, runtime) {
        log.audit("START - Library Globals","");

        var sourceRecordType = 'customrecord_contractlines';

        var ALL_SOURCE_DATA = {};
        var SOURCE_EXTERNAL_ID_TO_SOURCE_ID = {};

        var NEW_SOURCE_EXTERNAL_IDS = [];
        var UPDATE_SOURCE_EXTERNAL_IDS = [];

        var customrecord_contractlinesSearchObj = search.load({
            id: 'customsearch_clsearch_revrecplugin'
        })

        var searchResultCount = customrecord_contractlinesSearchObj.runPaged().count;
        log.debug("customrecord_contractlinesSearchObj result count",searchResultCount);
        //log.debug('searchresult', customrecord_contractlinesSearchObj)

        if (searchResultCount > 0){
            customrecord_contractlinesSearchObj.run().each(function(result){

                var internalId = result.getValue({name: 'internalid'})
                log.debug('internalId', internalId)
                var sourceExternalId = result.getValue({name: 'custrecord_is_cl_source_ext_id'});
                log.debug('sourceExternalId', sourceExternalId)
                var newSourceExternalId = result.getValue({name: 'custrecord_is_new_ext_id'});
                log.debug('newSourceExternalId', newSourceExternalId)
                var updateSourceExternalId = result.getValue({name: 'custrecord_is_update_rev_element'});
                log.debug('updateSourceExternalId', updateSourceExternalId)

                var customer = result.getValue({name: 'custrecord_is_cl_customer'})

                var project = result.getValue({name: 'custrecord_is_cl_job'})
                if (!isEmpty(project)){
                    customer = project
                }

                var accountingBook = result.getValue({name: 'custrecord_is_cl_acct_book'})
                log.debug('accountingbook', accountingBook)



                if (newSourceExternalId == true){
                    NEW_SOURCE_EXTERNAL_IDS.push(sourceExternalId)
                }
                if (updateSourceExternalId == true){
                    UPDATE_SOURCE_EXTERNAL_IDS.push(sourceExternalId)
                }

                SOURCE_EXTERNAL_ID_TO_SOURCE_ID[sourceExternalId] = result.getValue({name: 'internalid'})

                log.debug('ALL_SOURCE_DATA for sourceExternalId', sourceExternalId);
                log.debug('ALL_SOURCE_DATA order', result.getValue({name: 'custrecord_is_cl_order'}));
                log.debug('ALL_SOURCE_DATA item', result.getValue({name: 'custrecord_is_cl_item'}));
                log.debug('ALL_SOURCE_DATA quantity', result.getValue({name: 'custrecord_is_cl_quantity'}));
                ALL_SOURCE_DATA[sourceExternalId] = {
                    contracttag : result.getValue({name: 'custrecord_is_cl_contracttag'}),
                    order : result.getValue({name: 'custrecord_is_cl_order'}),
                    item : result.getValue({name: 'custrecord_is_cl_item'}),
                    quantity : result.getValue({name: 'custrecord_is_cl_quantity'}),
                    price : result.getValue({name: 'custrecord_is_cl_price'}),
                    totalprice : result.getValue({name: 'custrecord_is_cl_totalprice'}),
                    customer : customer,
                    enduser : result.getValue({name: 'custrecord_op_end_user'}),
                    date : result.getValue({name: 'custrecord_is_cl_date'}),
                    sed : result.getValue({name: 'custrecord_is_cl_source_ext_id'}),
                    revrecstartdate : result.getValue({name: 'custrecord_is_revrec_startdate'}),
                    revrecenddate : result.getValue({name: 'custrecord_is_revrec_enddate'}),
                    subsidiary : result.getValue({name: 'custrecord_is_cl_subsidiary'}),
                    currency : result.getValue({name: 'custrecord_is_cl_currency'}),
                    location : result.getValue({name: 'custrecord_is_cl_location'}),
                    department : result.getValue({name: 'custrecord_op_department'}),
                    classification : result.getValue({name: 'custrecord_op_erp'}),
                    exchangerate : result.getValue({name: 'custrecord_is_cl_exchangerate'}),
                    sfdealid : result.getValue({name: 'custrecord_is_cl_sf_deal_id'}),
                    accountingbook : accountingBook
                };
                log.debug('ALL_SOURCE_DATA all values', ALL_SOURCE_DATA[sourceExternalId]);
                log.debug('ALL_SOURCE_DATA all values full array', ALL_SOURCE_DATA);
                /*
                            var createForecastPlan = result.getValue({name: 'custrecord_is_cl_create_forecast_plan'})
                            //log.debug('createForecastPlan', createForecastPlan)

                            if (createForecastPlan == true){

                                var contractLineAmount = result.getValue({name: 'custrecord_is_cl_totalprice'})

                                var itemId =  result.getValue({name: 'custrecord_is_cl_item'})
                                //log.debug('itemId', itemId)
                                var itemObj = search.lookupFields({
                                    type: search.Type.ITEM,
                                    id: itemId,
                                    columns: ['createrevenueplanson']
                                });
                                //log.debug('createRevenuePlansOn', itemObj.createrevenueplanson[0].value)
                                var createRevenuePlansOn = itemObj.createrevenueplanson[0].value;
                                //log.debug('createRevenuePlansOn', createRevenuePlansOn)

                                var forecastEvent = record.create({
                                    type: record.Type.BILLING_REVENUE_EVENT
                                });
                                forecastEvent.setValue({fieldId: 'customform', value: 14});
                                forecastEvent.setValue({fieldId: 'recordtype', value: 347});
                                forecastEvent.setValue({fieldId: 'record', value: internalId});
                                forecastEvent.setValue({fieldId: 'eventtype', value: createRevenuePlansOn});
                                forecastEvent.setValue({fieldId: 'eventdate', value: new Date()});
                                forecastEvent.setValue({fieldId: 'eventpurpose', value: 'FORECAST'});

                                if (createRevenuePlansOn == 1 || 3) {
                                    forecastEvent.setValue({fieldId: 'amount', value: contractLineAmount});
                                }
                                if(createRevenuePlansOn == 2){
                                    forecastEvent.setValue({fieldId: 'cumulativepercentcomplete', value: 1});
                                }
                                    //forecastEvent.setValue({fieldId: 'quantity', value: 2 });
                                var forecastEventId = forecastEvent.save();
                                //log.debug('forecastEventId', forecastEventId)



                                var actualEvent = record.create({
                                    type: record.Type.BILLING_REVENUE_EVENT
                                });
                                actualEvent.setValue({fieldId: 'customform', value: 14});
                                actualEvent.setValue({fieldId: 'recordtype', value: 347});
                                actualEvent.setValue({fieldId: 'record', value: internalId});
                                actualEvent.setValue({fieldId: 'eventtype', value: createRevenuePlansOn});
                                actualEvent.setValue({fieldId: 'eventdate', value: new Date()});
                                actualEvent.setValue({fieldId: 'eventpurpose', value: 'ACTUAL'});

                                if (createRevenuePlansOn == 1 || 3) {
                                    actualEvent.setValue({fieldId: 'amount', value: contractLineAmount});
                                }
                                if(createRevenuePlansOn == 2){
                                    actualEvent.setValue({fieldId: 'cumulativepercentcomplete', value: 1});
                                }

                                var actualEventId = actualEvent.save();
                                    //log.debug('actualEventId', actualEventId)

                                log.debug('Uncheck Create Forcast Plan for internalid:', internalId);

                                    var setCreateForecastPlan = record.submitFields({
                                        type: 'customrecord_contractlines',
                                        id: internalId,
                                        values: {
                                            'custrecord_is_cl_create_forecast_plan': false
                                            //'custrecord_is_cl_forecast_plan': actualEventId
                                        }
                                    });

                            }

                            //log.debug('revrecstartdate', result.getValue({name: 'custrecord_revrec_startdate'}))
                            //log.debug('revrecenddate', result.getValue({name: 'custrecord_revrec_enddate'}))
                 */

                var remUsage = runtime.getCurrentScript().getRemainingUsage();
                log.debug('Remaining Governance Units', remUsage);


                // .run().each has a limit of 4,000 results
                return true;
            });
        }

        //log.debug("ALL_SOURCE_DATA", ALL_SOURCE_DATA)
        //log.debug("SOURCE_EXTERNAL_ID_TO_SOURCE_ID", SOURCE_EXTERNAL_ID_TO_SOURCE_ID)
        //log.debug("NEW_SOURCE_EXTERNAL_IDS", NEW_SOURCE_EXTERNAL_IDS)
        //log.debug("UPDATE_SOURCE_EXTERNAL_IDS", UPDATE_SOURCE_EXTERNAL_IDS)


        function getSourceRecordType() {
            return sourceRecordType;
        }

        function getSourceExternalIdsForRevenueElementCreation() {
            return NEW_SOURCE_EXTERNAL_IDS;
        }

        function getSourceExternalIdsForRevenueElementUpdate() {
            return UPDATE_SOURCE_EXTERNAL_IDS;
        }

        function getOrder(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].order;
        }

        function getArrangementKey(sourceExternalId) {
            log.debug('getArrangementKey for sourceExternalId', sourceExternalId);
            log.debug('getArrangementKey all values', ALL_SOURCE_DATA[sourceExternalId]);

            var arrangementKey = ALL_SOURCE_DATA[sourceExternalId].order;
            //var arrangementKey = '37505';//TEMP CODE TO HARDCODE ORDER - SWAPPED IN AND OUT WITH PREVIOUS LINE
            //var arrangementKey = (!isEmpty(ALL_SOURCE_DATA[sourceExternalId].contracttag)) ? ALL_SOURCE_DATA[sourceExternalId].contracttag: ALL_SOURCE_DATA[sourceExternalId].order
            //var arrangementKey = (ALL_SOURCE_DATA[sourceExternalId].contracttag + ALL_SOURCE_DATA[sourceExternalId].order)
            log.debug('arrangementKey', arrangementKey)
            return arrangementKey;

        }

        function getSubsidiary(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].subsidiary;
        }

        function getLocation(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].location;
        }

        function getDepartment(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].department;
        }

        function getClassification(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].classification;
        }

        function getCurrency(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].currency;
        }

        function getAccountingBook(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].accountingbook;
        }

        function getItem(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].item;
        }

        function getQuantity(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].quantity;
        }

        function getPrice(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].price;
        }

        function getTotalPrice(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].totalprice;
        }

        function getCustomer(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].customer;
        }

        function getEndUser(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].enduser;
        }

        function getDate(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].date;
        }

        function getRevRecStartDate(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].revrecstartdate;
        }

        function getRevRecEndDate(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].revrecenddate;
        }

        function getExchangeRate(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].exchangerate;
        }

        function getSFdealId(sourceExternalId) {
            return ALL_SOURCE_DATA[sourceExternalId].sfdealid;
        }

        function getSourceIdFromSourceExternalId(sourceExternalId)
        {
            return SOURCE_EXTERNAL_ID_TO_SOURCE_ID[sourceExternalId];
        }

        function notifyRevenueElementCreated(context)
        {
            var revenueElementId = context.input.revenueElement.revenueElementId;
            log.audit('Revenue Element created: ', revenueElementId);

        }

        function isEmpty (stValue) {

            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));

        };

        return {
            getSourceRecordType : getSourceRecordType,
            getSourceExternalIdsForRevenueElementUpdate : getSourceExternalIdsForRevenueElementUpdate,
            getSourceExternalIdsForRevenueElementCreation : getSourceExternalIdsForRevenueElementCreation,
            getRevRecStartDate : getRevRecStartDate,
            getRevRecEndDate : getRevRecEndDate,
            getOrder : getOrder,
            getArrangementKey : getArrangementKey,
            getSubsidiary : getSubsidiary,
            getLocation : getLocation,
            getDepartment : getDepartment,
            getClassification : getClassification,
            getCurrency : getCurrency,
            getAccountingBook : getAccountingBook,
            getItem : getItem,
            getQuantity : getQuantity,
            getPrice : getPrice,
            getTotalPrice : getTotalPrice,
            getCustomer : getCustomer,
            getEndUser : getEndUser,
            getDate : getDate,
            getExchangeRate : getExchangeRate,
            getSFdealId : getSFdealId,
            getSourceIdFromSourceExternalId : getSourceIdFromSourceExternalId,
            notifyRevenueElementCreated : notifyRevenueElementCreated
        };
    }
);
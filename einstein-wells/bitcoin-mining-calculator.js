#!/usr/bin/env node

/**
 * Bitcoin Mining Power Requirements Calculator
 * For Einstein Wells QSVM Mining Operations
 */

class BitcoinMiningCalculator {
  constructor() {
    // Current Bitcoin network stats (approximate)
    this.currentNetworkHashrate = 450e18; // 450 EH/s (exahashes per second)
    this.currentDifficulty = 62.5e12; // Current difficulty
    this.bitcoinRewardPerBlock = 6.25; // Current block reward
    this.blocksPerDay = 144; // Blocks mined per day
    this.totalBitcoinPerDay = this.blocksPerDay * this.bitcoinRewardPerBlock; // ~900 BTC/day total
    
    // XMRig mining efficiency (RandomX for Monero, converted to Bitcoin via NiceHash)
    this.xmrigHashratePerWatt = 0.15; // H/s per Watt for RandomX
    this.nicehashConversionRate = 0.85; // NiceHash takes 15% fee
    this.poolFee = 0.02; // 2% pool fee total for 2 pools
    this.electricalEfficiency = 0.92; // PSU efficiency
    
    // Power specifications
    this.voltage = 240; // 240V for high-power mining
  }

  calculateRequiredHashrate(bitcoinPerDay) {
    // What percentage of total Bitcoin network this represents
    const networkPercentage = bitcoinPerDay / this.totalBitcoinPerDay;
    
    // Required hashrate to achieve this percentage
    const requiredHashrate = this.currentNetworkHashrate * networkPercentage;
    
    return requiredHashrate;
  }

  calculatePowerRequirements(bitcoinPerDay) {
    const requiredHashrate = this.calculateRequiredHashrate(bitcoinPerDay);
    
    // Convert to more manageable units
    const hashrateInTH = requiredHashrate / 1e12; // Terahashes
    const hashrateInEH = requiredHashrate / 1e18; // Exahashes
    
    // Power calculation based on XMRig efficiency
    const rawPowerWatts = requiredHashrate / this.xmrigHashratePerWatt;
    const totalPowerWatts = rawPowerWatts / this.electricalEfficiency;
    const totalPowerKW = totalPowerWatts / 1000;
    const totalPowerMW = totalPowerKW / 1000;
    
    // Calculate amperage at 240V
    const currentAmps = totalPowerWatts / this.voltage;
    
    // Calculate costs (approximate)
    const electricityCostPerKWh = 0.12; // $0.12 per kWh
    const dailyElectricityCost = totalPowerKW * 24 * electricityCostPerKWh;
    const monthlyElectricityCost = dailyElectricityCost * 30;
    
    // Revenue calculation
    const bitcoinPrice = 67000; // Approximate BTC price
    const dailyRevenue = bitcoinPerDay * bitcoinPrice;
    const monthlyRevenue = dailyRevenue * 30;
    const netDailyProfit = dailyRevenue - dailyElectricityCost;
    
    // Hardware requirements (approximate)
    const s19ProHashrate = 110e12; // 110 TH/s per Antminer S19 Pro
    const s19ProPower = 3250; // 3.25 kW per S19 Pro
    const requiredS19Units = Math.ceil(requiredHashrate / s19ProHashrate);
    const hardwareCost = requiredS19Units * 2500; // $2,500 per unit
    
    return {
      bitcoinPerDay,
      requiredHashrate: {
        raw: requiredHashrate,
        TH: hashrateInTH,
        EH: hashrateInEH
      },
      power: {
        watts: totalPowerWatts,
        kilowatts: totalPowerKW,
        megawatts: totalPowerMW,
        amperage: currentAmps
      },
      costs: {
        dailyElectricity: dailyElectricityCost,
        monthlyElectricity: monthlyElectricityCost,
        hardwareCost: hardwareCost
      },
      revenue: {
        dailyRevenue: dailyRevenue,
        monthlyRevenue: monthlyRevenue,
        netDailyProfit: netDailyProfit
      },
      hardware: {
        s19ProUnits: requiredS19Units,
        totalPowerDraw: requiredS19Units * s19ProPower
      },
      networkShare: (bitcoinPerDay / this.totalBitcoinPerDay * 100).toFixed(2)
    };
  }

  generateReport() {
    const targets = [35, 50, 100, 150, 200];
    
    console.log('🌊 EINSTEIN WELLS BITCOIN MINING POWER REQUIREMENTS');
    console.log('📊 XMRig + 2 Pools Configuration Analysis\n');
    console.log('=' .repeat(100));
    
    targets.forEach(target => {
      const analysis = this.calculatePowerRequirements(target);
      
      console.log(`\n🎯 TARGET: ${target} Bitcoin per Day`);
      console.log(`Network Share Required: ${analysis.networkShare}%`);
      console.log(`Required Hashrate: ${analysis.requiredHashrate.EH.toFixed(2)} EH/s (${analysis.requiredHashrate.TH.toFixed(0)} TH/s)`);
      console.log(`\n⚡ POWER REQUIREMENTS:`);
      console.log(`  Power Draw: ${analysis.power.megawatts.toFixed(1)} MW (${analysis.power.kilowatts.toFixed(0)} kW)`);
      console.log(`  Amperage @ 240V: ${analysis.power.amperage.toLocaleString()} Amps`);
      console.log(`\n💰 ECONOMICS:`);
      console.log(`  Daily Revenue: $${analysis.revenue.dailyRevenue.toLocaleString()}`);
      console.log(`  Daily Electricity: $${analysis.costs.dailyElectricity.toLocaleString()}`);
      console.log(`  Net Daily Profit: $${analysis.revenue.netDailyProfit.toLocaleString()}`);
      console.log(`  Hardware Cost: $${analysis.costs.hardwareCost.toLocaleString()}`);
      console.log(`\n🏭 HARDWARE (Equivalent S19 Pro Units):`);
      console.log(`  Units Required: ${analysis.hardware.s19ProUnits.toLocaleString()}`);
      console.log(`  Total Power Draw: ${analysis.hardware.totalPowerDraw.toLocaleString()} kW`);
      console.log('-'.repeat(80));
    });

    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('• These calculations assume current Bitcoin network difficulty');
    console.log('• Actual results depend on network conditions and mining efficiency');
    console.log('• XMRig is CPU mining - industrial ASIC miners needed for these scales');
    console.log('• Einstein Wells QSVM distribution could reduce individual node requirements');
    console.log('• 2-pool setup provides redundancy and optimizes mining strategy');
  }
}

// Execute the analysis
const calculator = new BitcoinMiningCalculator();
calculator.generateReport();
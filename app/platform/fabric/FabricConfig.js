/*
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const helper = require('../../common/helper');
const explorer_mess = require('../../common/ExplorerMessage').explorer;
const ExplorerError = require('../../common/ExplorerError');

const logger = helper.getLogger('FabricConfig');

/**
 *
 *
 * @class FabricConfig
 */
class FabricConfig {
	/**
	 * Creates an instance of FabricConfig.
	 * @memberof FabricConfig
	 */

	/*eslint-disable */
	constructor() {}

	/* eslint-enable */
	/**
	 *
	 *
	 * @param {*} configPath
	 * @memberof FabricConfig
	 */

	initialize(configPath) {
		const configJson = fs.readFileSync(configPath, 'utf8');
		this.config = JSON.parse(configJson);
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getConfig() {
		return this.config;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	isFabricCaEnabled() {
		if (this.config.certificateAuthorities === undefined) {
			return false;
		}

		const org = this.getOrganization();
		const caArray = this.config.organizations[org].certificateAuthorities;
		if (caArray === undefined) {
			return false;
		}

		const caName = caArray[0];
		if (this.config.certificateAuthorities[caName] === undefined) {
			return false;
		}
		logger.info('Fabric CA: Enabled');
		return true;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getOrganization() {
		return this.config.client.organization;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getTls() {
		logger.info('config.client.tlsEnable ', this.config.client.tlsEnable);
		return this.config.client.tlsEnable;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getEnableAuthentication() {
		return this.config.client.enableAuthentication;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getAdminUser() {
		if (
			!this.config.client ||
			!this.config.client.adminCredential ||
			!this.config.client.adminCredential.id
		) {
			logger.error('client.adminCredential.id is undefined');
			return null;
		}
		return this.config.client.adminCredential.id;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getAdminPassword() {
		if (
			!this.config.client ||
			!this.config.client.adminCredential ||
			!this.config.client.adminCredential.password
		) {
			logger.error('client.adminCredential.password is undefined');
			return null;
		}
		return this.config.client.adminCredential.password;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getAdminAffiliation() {
		return this.config.client.adminCredential.affiliation;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getCaAdminUser() {
		return this.config.client.caCredential.id;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getCaAdminPassword() {
		return this.config.client.caCredential.password;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getNetworkName() {
		return this.config.name;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getDefaultChannel() {
		let defChannel;
		for (const x in this.config.channels) {
			// Getting default channel
			logger.info('FabricConfig, this.config.channels ', x);
			if (x) {
				defChannel = x;
			}
		}
		return defChannel;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getPeersConfig() {
		const peers = [];
		for (const x in this.config.peers) {
			// TODO may need to handle multiple fabric-ca server ??
			if (this.config.peers[x].url) {
				const peer = {
					name: x,
					url: this.config.peers[x].url,
					tlsCACerts: this.config.peers[x].tlsCACerts,
					eventUrl: this.config.peers[x].eventUrl,
					grpcOptions: this.config.peers[x].grpcOptions
				};
				peers.push(peer);
			}
		}
		return peers;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getOrgSignedCertPem() {
		const organization = this.config.organizations[this.getOrganization()];
		if (
			organization.signedCert === undefined ||
			(organization.signedCert.path === undefined &&
				organization.signedCert.pem === undefined)
		) {
			logger.error('Not found signedCert configuration');
			throw new ExplorerError(explorer_mess.error.ERROR_2015);
		}

		if (organization.signedCert.path !== undefined) {
			return fs.readFileSync(
				path.resolve(__dirname, '../../..', organization.signedCert.path),
				'utf8'
			);
		}
		return organization.signedCert.pem;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getOrgAdminPrivateKeyPem() {
		const organization = this.config.organizations[this.getOrganization()];
		if (
			organization.adminPrivateKey === undefined ||
			(organization.adminPrivateKey.path === undefined &&
				organization.adminPrivateKey.pem === undefined)
		) {
			logger.error('Not found adminPrivateKey configuration');
			throw new ExplorerError(explorer_mess.error.ERROR_2015);
		}

		if (organization.adminPrivateKey.path !== undefined) {
			return fs.readFileSync(
				path.resolve(__dirname, '../../..', organization.adminPrivateKey.path),
				'utf8'
			);
		}
		return organization.adminPrivateKey.pem;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getPeerTlsCACertsPem(peer) {
		const tlsCACerts = this.config.peers[peer].tlsCACerts;
		if (
			tlsCACerts === undefined ||
			(tlsCACerts.path === undefined && tlsCACerts.pem === undefined)
		) {
			logger.error(`Not found tlsCACerts configuration: ${peer.url}`);
			return '';
		}

		if (tlsCACerts.path !== undefined) {
			return fs.readFileSync(
				path.resolve(__dirname, '../../..', tlsCACerts.path),
				'utf8'
			);
		}
		return tlsCACerts.pem;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getMspId() {
		const organization = this.config.organizations[this.getOrganization()];
		return organization.mspid;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getCertificateAuthorities() {
		const caURL = [];
		let serverCertPath = null;

		if (this.config.certificateAuthorities) {
			for (const x in this.config.certificateAuthorities) {
				if (this.config.certificateAuthorities[x].tlsCACerts) {
					serverCertPath = this.config.certificateAuthorities[x].tlsCACerts.path;
				}
				if (this.config.certificateAuthorities[x].url) {
					caURL.push(this.config.certificateAuthorities[x].url);
				}
			}
		}
		return { caURL, serverCertPath };
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof FabricConfig
	 */
	getPeers() {
		const peers = [];
		for (const x in this.config.peers) {
			if (this.config.peers[x].url) {
				const peer = {
					name: x,
					url: this.config.peers[x].url,
					tlsCACerts: this.config.peers[x].tlsCACerts,
					eventUrl: this.config.peers[x].eventUrl,
					grpcOptions: this.config.peers[x].grpcOptions
				};
				peers.push(peer);
			}
		}
		return peers;
	}
}

module.exports = FabricConfig;

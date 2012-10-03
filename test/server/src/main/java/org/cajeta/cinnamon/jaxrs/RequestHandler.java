/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.core.MediaType;

import org.cajeta.cinnamon.jaxrs.message.CinnamonResponse;
import org.cajeta.cinnamon.jaxrs.message.RequestContext;
import org.jboss.netty.handler.codec.http.HttpMethod;

/**
 * @author julian
 *
 */
public abstract class RequestHandler {
	public static final String CONSUMES = ":consumes=";
	private HttpMethod httpMethod;	
	private Set<String> consumes = new HashSet<String>();
	private String path;
	
	public RequestHandler() { }
	
	public RequestHandler(HttpMethod httpMethod) {
		this.httpMethod = httpMethod;
	}
	
	public abstract CinnamonResponse execute(RequestContext httpRequestContext);
			
	/**
	 * @return the consumes
	 */
	public Set<String> getConsumes() {
		if (consumes.isEmpty())
			consumes.add(MediaType.WILDCARD);

		return consumes;
	}
	/**
	 * @param consumes the consumes to set
	 */
	public void addConsumes(String[] consumes) {
		for (String entry : consumes)
			this.consumes.add(entry);
	}

	/**
	 * @return the httpMethod
	 */
	public HttpMethod getHttpMethod() {
		return httpMethod;
	}

	/**
	 * @param httpMethod the httpMethod to set
	 */
	public void setHttpMethod(HttpMethod httpMethod) {
		this.httpMethod = httpMethod;
	}

	/**
	 * @return the path
	 */
	public String getPath() {
		return path;
	}

	/**
	 * @param path the path to set
	 */
	public void setPath(String path) {
		this.path = path;
	}
}
